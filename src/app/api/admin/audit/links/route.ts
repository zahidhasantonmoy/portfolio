import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export interface LinkCheckResult {
  url: string;
  sourceType: "post" | "project";
  sourceId: string;
  sourceTitle: string;
  linkText?: string;
  status: number;
  ok: boolean;
  latencyMs: number;
  error?: string;
}

// Extract markdown [text](url) from text
function extractMarkdownLinks(text: string): { url: string; text: string }[] {
  const links: { url: string; text: string }[] = [];
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    links.push({
      text: match[1],
      url: match[2],
    });
  }
  return links;
}

// Test a single URL with 5-second timeout
async function testUrl(url: string): Promise<{ status: number; ok: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    let res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    // If method not allowed, try GET with range request
    if (res.status === 405 || res.status === 403) {
      res = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          Range: "bytes=0-1024",
        },
        redirect: "follow",
      });
    }

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - start;
    const ok = res.ok || (res.status >= 200 && res.status < 400);

    return {
      status: res.status,
      ok,
      latencyMs,
      error: ok ? undefined : `HTTP ${res.status} ${res.statusText || ""}`,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - start;
    const isTimeout = err.name === "AbortError";
    return {
      status: 0,
      ok: false,
      latencyMs,
      error: isTimeout ? "Connection timed out (>6s)" : (err.message || "Unreachable / DNS error"),
    };
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    let candidateLinks: { url: string; sourceType: "post" | "project"; sourceId: string; sourceTitle: string; linkText?: string }[] = [];

    if (Array.isArray(body.urls) && body.urls.length > 0) {
      candidateLinks = body.urls;
    } else {
      // Auto-crawl from database
      const [postsRes, projectsRes] = await Promise.all([
        sql`SELECT id, title_en, content_en, content_bn FROM posts ORDER BY created_at DESC LIMIT 50`.catch(() => []),
        sql`SELECT id, title, live_url, github_url FROM projects ORDER BY created_at DESC LIMIT 30`.catch(() => []),
      ]);

      // Extract from posts
      for (const p of postsRes) {
        const fullContent = `${p.content_en || ""} ${p.content_bn || ""}`;
        const links = extractMarkdownLinks(fullContent);
        for (const l of links) {
          candidateLinks.push({
            url: l.url,
            sourceType: "post",
            sourceId: p.id,
            sourceTitle: p.title_en || "Blog Post",
            linkText: l.text,
          });
        }
      }

      // Extract from projects
      for (const prj of projectsRes) {
        if (prj.live_url && prj.live_url.startsWith("http")) {
          candidateLinks.push({
            url: prj.live_url,
            sourceType: "project",
            sourceId: prj.id,
            sourceTitle: prj.title,
            linkText: "Live Demo",
          });
        }
        if (prj.github_url && prj.github_url.startsWith("http")) {
          candidateLinks.push({
            url: prj.github_url,
            sourceType: "project",
            sourceId: prj.id,
            sourceTitle: prj.title,
            linkText: "GitHub Repo",
          });
        }
      }
    }

    // Deduplicate candidate URLs to avoid spamming the same external host
    const uniqueMap = new Map<string, typeof candidateLinks[0]>();
    for (const item of candidateLinks) {
      if (!uniqueMap.has(item.url)) {
        uniqueMap.set(item.url, item);
      }
    }
    const linksToTest = Array.from(uniqueMap.values()).slice(0, 40); // Cap at 40 links per batch

    // Test links in concurrent batches of 5
    const results: LinkCheckResult[] = [];
    const batchSize = 5;
    for (let i = 0; i < linksToTest.length; i += batchSize) {
      const batch = linksToTest.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (item) => {
          const testRes = await testUrl(item.url);
          return {
            url: item.url,
            sourceType: item.sourceType,
            sourceId: item.sourceId,
            sourceTitle: item.sourceTitle,
            linkText: item.linkText,
            status: testRes.status,
            ok: testRes.ok,
            latencyMs: testRes.latencyMs,
            error: testRes.error,
          };
        })
      );
      results.push(...batchResults);
    }

    return NextResponse.json({
      totalScanned: results.length,
      brokenCount: results.filter((r) => !r.ok).length,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Link audit failed" }, { status: 500 });
  }
}
