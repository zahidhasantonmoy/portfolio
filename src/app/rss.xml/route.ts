import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const SITE_URL = "https://zahidhasantonmoy.vercel.app";

export async function GET() {
  let posts: any[] = [];

  try {
    posts = await sql`
      SELECT id, title_en, slug, excerpt_en, content_en, cover_image_url, published_at, post_type
      FROM posts
      WHERE status = 'published' AND published_at <= NOW()
      ORDER BY published_at DESC
      LIMIT 50
    `;
  } catch (error) {
    console.error("[RSS Feed] Error fetching posts from database:", error);
  }

  const lastBuildDate =
    posts.length > 0 && posts[0].published_at
      ? new Date(posts[0].published_at).toUTCString()
      : new Date().toUTCString();

  const itemsXml = posts
    .map((post) => {
      const postUrl = `${SITE_URL}/${post.post_type === "journal" ? "journal" : "blog"}/${post.slug}`;
      const pubDate = post.published_at ? new Date(post.published_at).toUTCString() : new Date().toUTCString();
      const title = post.title_en || "Untitled Post";
      const excerpt = post.excerpt_en || "";
      const content = post.content_en || excerpt;
      const imageUrl = post.cover_image_url
        ? post.cover_image_url.startsWith("http")
          ? post.cover_image_url
          : `${SITE_URL}${post.cover_image_url}`
        : null;

      return `    <item>
      <title><![CDATA[${title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${excerpt}]]></description>
      <content:encoded><![CDATA[${content}]]></content:encoded>
      <author>tonmoyhasan275@gmail.com (Zahid Hasan Tonmoy)</author>
      ${imageUrl ? `<enclosure url="${imageUrl}" type="image/jpeg" length="0" />` : ""}
    </item>`;
    })
    .join("\n");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Zahid Hasan Tonmoy | Blog &amp; Tech Articles</title>
    <link>${SITE_URL}/blog</link>
    <description>Engineering deep-dives, full-stack web development (React, Next.js, Node.js), and AI Agent architectures by Zahid Hasan Tonmoy.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/images/og-image.jpg</url>
      <title>Zahid Hasan Tonmoy | Blog</title>
      <link>${SITE_URL}/blog</link>
    </image>
${itemsXml}
  </channel>
</rss>`;

  return new Response(rssXml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
