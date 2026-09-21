/**
 * POST /api/admin/cross-post
 * Cross-posts a blog article to DEV.to as a draft.
 * Requires DEVTO_API_KEY in environment variables.
 *
 * Body:
 *   platform  : "devto"
 *   title     : string
 *   content   : string (Markdown)
 *   tags      : string[] (max 4 for DEV.to)
 *   canonicalUrl : string (your portfolio blog URL — critical for SEO)
 *   coverImage?: string
 *   description?: string
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  // Auth guard — admin only
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { platform, title, content, tags = [], canonicalUrl, coverImage, description } = body;

    if (!platform || !title || !content) {
      return NextResponse.json(
        { error: "platform, title, and content are required." },
        { status: 400 }
      );
    }

    if (platform === "devto") {
      return await crossPostToDevTo({ title, content, tags, canonicalUrl, coverImage, description });
    }

    if (platform === "medium") {
      return await crossPostToMedium({ title, content, tags, canonicalUrl });
    }

    return NextResponse.json({ error: `Unsupported platform: ${platform}` }, { status: 400 });

  } catch (err: unknown) {
    console.error("[CrossPost] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Cross-post failed" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────
// DEV.to Integration
// Docs: https://developers.forem.com/api/v1
// ─────────────────────────────────────────
async function crossPostToDevTo({
  title,
  content,
  tags,
  canonicalUrl,
  coverImage,
  description,
}: {
  title: string;
  content: string;
  tags: string[];
  canonicalUrl?: string;
  coverImage?: string;
  description?: string;
}) {
  const apiKey = process.env.DEVTO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "DEVTO_API_KEY is not configured." }, { status: 500 });
  }

  // DEV.to accepts max 4 tags, must be lowercase letters/numbers/hyphens
  let cleanTags = tags
    .slice(0, 4)
    .map((t) => t.toLowerCase().replace(/[^a-z0-9-]/g, "").trim())
    .filter(Boolean);

  // SEO Fallback: If no valid tags supplied, provide relevant discovery tags
  if (cleanTags.length === 0) {
    cleanTags = ["webdev", "programming", "javascript", "tech"];
  }

  // SEO Attribution & Canonical Backlink:
  // Appends a permanent dofollow markdown backlink to Zahid's portfolio.
  // This preserves SEO PageRank, domain authority, and referral traffic even if aggregators scrape DEV.to.
  let bodyWithSeoAttribution = content;
  if (canonicalUrl && !bodyWithSeoAttribution.includes(canonicalUrl)) {
    bodyWithSeoAttribution = `${bodyWithSeoAttribution.trimEnd()}

---

*This article was originally published on [**Zahid Hasan Tonmoy's Portfolio**](${canonicalUrl}).*
*Connect with Zahid on [GitHub](https://github.com/zahidhasantonmoy) & [LinkedIn](https://www.linkedin.com/in/zahidhasantonmoy).*`;
  }

  const articlePayload: Record<string, unknown> = {
    article: {
      title,
      body_markdown: bodyWithSeoAttribution,
      published: false, // Always draft first — review before publishing
      tags: cleanTags,
      ...(canonicalUrl && { canonical_url: canonicalUrl }),
      ...(description && { description }),
      ...(coverImage && { main_image: coverImage }),
    },
  };

  const res = await fetch("https://dev.to/api/articles", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(articlePayload),
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || JSON.stringify(data);
    console.error("[DEV.to] API error:", errorMsg);
    return NextResponse.json(
      { error: `DEV.to API error: ${errorMsg}` },
      { status: res.status }
    );
  }

  return NextResponse.json({
    success: true,
    platform: "devto",
    id: data.id,
    url: data.url,
    status: data.published ? "published" : "draft",
    title: data.title,
  });
}

// ─────────────────────────────────────────
// Medium Integration
// Docs: https://github.com/Medium/medium-api-docs
// ─────────────────────────────────────────
async function crossPostToMedium({
  title,
  content,
  tags,
  canonicalUrl,
}: {
  title: string;
  content: string;
  tags: string[];
  canonicalUrl?: string;
}) {
  const token = process.env.MEDIUM_INTEGRATION_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        error:
          "MEDIUM_INTEGRATION_TOKEN is not configured in .env.local. You can generate an Integration Token in your Medium Settings -> Security and apps -> Integration tokens.",
        needsToken: true,
      },
      { status: 400 }
    );
  }

  // 1. Get current user's authorId
  const meRes = await fetch("https://api.medium.com/v1/me", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Accept-Charset": "utf-8",
    },
  });

  const meData = await meRes.json();
  if (!meRes.ok || !meData?.data?.id) {
    const errorMsg = meData?.errors?.[0]?.message || "Failed to authenticate with Medium using your token.";
    return NextResponse.json({ error: errorMsg }, { status: 401 });
  }

  const authorId = meData.data.id;

  // Append canonical backlink if not present
  let bodyContent = content;
  if (canonicalUrl && !bodyContent.includes(canonicalUrl)) {
    bodyContent = `${bodyContent.trimEnd()}

---

*This article was originally published on [**Zahid Hasan Tonmoy's Portfolio**](${canonicalUrl}).*`;
  }

  // 2. Post article to Medium as draft
  const postRes = await fetch(`https://api.medium.com/v1/users/${authorId}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Charset": "utf-8",
    },
    body: JSON.stringify({
      title,
      contentFormat: "markdown",
      content: bodyContent,
      tags: tags.slice(0, 5),
      canonicalUrl: canonicalUrl || undefined,
      publishStatus: "draft",
    }),
  });

  const postData = await postRes.json();
  if (!postRes.ok) {
    const errorMsg = postData?.errors?.[0]?.message || "Medium post creation failed.";
    return NextResponse.json({ error: errorMsg }, { status: postRes.status });
  }

  return NextResponse.json({
    success: true,
    platform: "medium",
    id: postData.data.id,
    url: postData.data.url,
    status: postData.data.publishStatus,
    title: postData.data.title,
  });
}
