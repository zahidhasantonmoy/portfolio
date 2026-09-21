import { sql } from "@/lib/db";
import MediaLibraryClient, { MediaItem } from "./MediaLibraryClient";

export const revalidate = 0; // Dynamic route

export default async function MediaLibraryPage() {
  const [postsRes, projectsRes] = await Promise.all([
    sql`
      SELECT id, title_en, cover_image_url, post_type, created_at 
      FROM posts 
      WHERE cover_image_url IS NOT NULL AND cover_image_url != '' 
      ORDER BY created_at DESC
    `.catch(() => []),
    sql`
      SELECT id, title, image_url, created_at 
      FROM projects 
      WHERE image_url IS NOT NULL AND image_url != '' 
      ORDER BY created_at DESC
    `.catch(() => []),
  ]);

  const mediaItems: MediaItem[] = [];

  // Map blog post covers
  for (const p of postsRes) {
    if (p.cover_image_url && typeof p.cover_image_url === "string") {
      mediaItems.push({
        id: `post-${p.id}`,
        url: p.cover_image_url,
        title: p.title_en || "Untitled Article",
        source: p.post_type === "journal" ? "journal" : "blog",
        sourceId: p.id,
        createdAt: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
      });
    }
  }

  // Map project images
  for (const prj of projectsRes) {
    if (prj.image_url && typeof prj.image_url === "string") {
      mediaItems.push({
        id: `project-${prj.id}`,
        url: prj.image_url,
        title: prj.title || "Untitled Project",
        source: "project",
        sourceId: prj.id,
        createdAt: prj.created_at ? new Date(prj.created_at).toISOString() : new Date().toISOString(),
      });
    }
  }

  return <MediaLibraryClient initialMedia={mediaItems} />;
}
