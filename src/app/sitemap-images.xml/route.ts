import { getAllPublishedPostsForSitemap } from "@/lib/blog";
import { sql } from "@/lib/db";

export const revalidate = 3600; // Cache for 1 hour

function escapeXml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const base = "https://zahidhasantonmoy.vercel.app";

  try {
    const [posts, projects] = await Promise.all([
      getAllPublishedPostsForSitemap().catch(() => []),
      sql`
        SELECT title, image_url, description 
        FROM projects 
        WHERE image_url IS NOT NULL AND image_url != ''
        ORDER BY display_order ASC, created_at DESC
      `.catch(() => []),
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- 1. Homepage & Profile Images -->
  <url>
    <loc>${base}</loc>
    <image:image>
      <image:loc>${base}/images/profile.jpg</image:loc>
      <image:title>Zahid Hasan Tonmoy - Full Stack Developer &amp; AI Engineer</image:title>
      <image:caption>Zahid Hasan Tonmoy - Full Stack Developer profile photo</image:caption>
    </image:image>
  </url>
`;

    // 2. Project Portfolio Images
    if (Array.isArray(projects) && projects.length > 0) {
      for (const prj of projects) {
        if (!prj.image_url) continue;
        xml += `  <url>
    <loc>${base}#projects</loc>
    <image:image>
      <image:loc>${escapeXml(prj.image_url)}</image:loc>
      <image:title>${escapeXml(prj.title || "Project")}</image:title>
      <image:caption>${escapeXml(prj.description || "Portfolio Project by Zahid Hasan Tonmoy")}</image:caption>
    </image:image>
  </url>
`;
      }
    }

    // 3. Blog Post Cover Images (English and Bengali)
    if (Array.isArray(posts) && posts.length > 0) {
      for (const post of posts) {
        if (!post.cover_image_url) continue;

        const postPath = post.post_type === "journal" ? "journal" : "blog";
        const cleanImgUrl = escapeXml(post.cover_image_url);
        const cleanTitleEn = escapeXml(post.title_en || "Blog Post Cover");
        const cleanExcerptEn = escapeXml(post.excerpt_en || post.title_en || "");

        // English URL entry
        xml += `  <url>
    <loc>${base}/${postPath}/${escapeXml(post.slug)}</loc>
    <image:image>
      <image:loc>${cleanImgUrl}</image:loc>
      <image:title>${cleanTitleEn}</image:title>
      <image:caption>${cleanExcerptEn}</image:caption>
    </image:image>
  </url>
`;

        // Bengali URL entry if blog
        if (post.post_type === "blog" && post.title_bn) {
          const cleanTitleBn = escapeXml(post.title_bn);
          const cleanExcerptBn = escapeXml(post.excerpt_bn || post.title_bn || "");
          xml += `  <url>
    <loc>${base}/bn/blog/${escapeXml(post.slug)}</loc>
    <image:image>
      <image:loc>${cleanImgUrl}</image:loc>
      <image:title>${cleanTitleBn}</image:title>
      <image:caption>${cleanExcerptBn}</image:caption>
    </image:image>
  </url>
`;
        }
      }
    }

    xml += `</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error: any) {
    console.error("[sitemap-images] Error generating image sitemap:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      {
        status: 200,
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      }
    );
  }
}
