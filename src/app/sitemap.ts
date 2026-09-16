import { getAllPublishedPostsForSitemap } from "@/lib/blog";
import type { MetadataRoute } from "next";

export const revalidate = 3600; // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://zahidhasantonmoy.vercel.app";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/bn/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/journal`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/newsletter`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/files/Resume/Zahid_Hasan_Resume.pdf`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  // Dynamic blog posts
  try {
    const posts = await getAllPublishedPostsForSitemap();

    const postPages: MetadataRoute.Sitemap = posts.flatMap((post) => {
      const lastMod = new Date(post.updated_at ?? post.published_at ?? new Date());
      const pages: MetadataRoute.Sitemap = [
        {
          url: `${base}/${post.post_type === "journal" ? "journal" : "blog"}/${post.slug}`,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: post.post_type === "blog" ? 0.8 : 0.6,
        },
      ];

      // Add Bangla URL if applicable
      if (post.post_type === "blog") {
        pages.push({
          url: `${base}/bn/blog/${post.slug}`,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }

      return pages;
    });

    return [...staticPages, ...postPages];
  } catch {
    // DB might not be configured yet
    return staticPages;
  }
}
