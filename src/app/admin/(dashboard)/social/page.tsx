import { sql } from "@/lib/db";
import SocialManagerClient from "./SocialManagerClient";

export const revalidate = 0;

export default async function AdminSocialPage() {
  let posts: any[] = [];
  try {
    posts = await sql`
      SELECT p.id, p.title_en, p.slug, p.excerpt_en, p.content_en, p.cover_image_url,
             p.status, p.created_at, p.published_at,
             c.name_en as cat_name
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
      LIMIT 50
    `;
  } catch (err) {
    console.error("[AdminSocialPage] Failed to fetch posts:", err);
    posts = [];
  }

  return (
    <div className="max-w-6xl mx-auto">
      <SocialManagerClient initialPosts={posts || []} />
    </div>
  );
}
