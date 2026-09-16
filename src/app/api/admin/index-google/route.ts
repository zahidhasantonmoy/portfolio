import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional
    }

    const { slug, url } = body;
    const siteUrl = "https://zahidhasantonmoy.vercel.app";
    const sitemapUrl = `${siteUrl}/sitemap.xml`;

    const targetUrls: string[] = [sitemapUrl];
    if (slug) {
      targetUrls.push(`${siteUrl}/blog/${slug}`);
      targetUrls.push(`${siteUrl}/bn/blog/${slug}`);
    } else if (url) {
      targetUrls.push(url);
    }

    // Ping search engines
    const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;

    const results: Record<string, any> = {};

    // 1. Ping Google
    try {
      const googleRes = await fetch(googlePingUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; PortfolioBot/2.0; +https://zahidhasantonmoy.vercel.app)",
        },
      });
      results.google = {
        status: googleRes.status,
        ok: googleRes.ok || googleRes.status < 400,
      };
    } catch (err: any) {
      results.google = {
        status: 500,
        ok: false,
        error: err?.message || "Failed to reach Google",
      };
    }

    // 2. Ping Bing
    try {
      const bingRes = await fetch(bingPingUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; PortfolioBot/2.0; +https://zahidhasantonmoy.vercel.app)",
        },
      });
      results.bing = {
        status: bingRes.status,
        ok: bingRes.ok || bingRes.status < 400,
      };
    } catch (err: any) {
      results.bing = {
        status: 500,
        ok: false,
        error: err?.message || "Failed to reach Bing",
      };
    }

    return NextResponse.json({
      success: true,
      message: "Search engines pinged successfully for immediate crawling and indexing!",
      pingedUrls: targetUrls,
      results,
    });
  } catch (error: any) {
    console.error("[Index Google API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to trigger search engine indexing",
      },
      { status: 500 }
    );
  }
}
