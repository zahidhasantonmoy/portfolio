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
    const imageSitemapUrl = `${siteUrl}/sitemap-images.xml`;

    const targetUrls: string[] = [sitemapUrl, imageSitemapUrl];
    if (slug) {
      targetUrls.push(`${siteUrl}/blog/${slug}`);
      targetUrls.push(`${siteUrl}/bn/blog/${slug}`);
    } else if (url) {
      targetUrls.push(url);
    }

    const inspectionTarget = slug ? `${siteUrl}/blog/${slug}` : (url || siteUrl);

    // Deep links for Google Search Console
    const gscLinks = {
      sitemapSubmission: `https://search.google.com/search-console/sitemaps`,
      urlInspection: `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(siteUrl + "/")}&id=${encodeURIComponent(inspectionTarget)}`,
      googleImageSearchCheck: `https://www.google.com/search?q=${encodeURIComponent("site:" + new URL(siteUrl).hostname)}&tbm=isch`,
    };

    // Ping search engines
    const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    const results: Record<string, any> = {};

    // 1. Bing Ping
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
      message: "Search engines notified. Use the provided Google Search Console links to submit/inspect immediately!",
      pingedUrls: targetUrls,
      sitemaps: {
        web: sitemapUrl,
        images: imageSitemapUrl,
      },
      gscLinks,
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
