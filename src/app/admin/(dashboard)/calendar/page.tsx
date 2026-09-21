import { sql } from "@/lib/db";
import CalendarClient, { CalendarEventItem } from "./CalendarClient";

export const revalidate = 0; // Dynamic route

export default async function CalendarPage() {
  const [postsRes, logsRes] = await Promise.all([
    sql`
      SELECT id, title_en, title_bn, slug, post_type, status, published_at, created_at, cover_image_url
      FROM posts
      ORDER BY COALESCE(published_at, created_at) DESC
    `.catch(() => []),
    sql`
      SELECT id, title, log_date, mood, created_at
      FROM development_logs
      ORDER BY log_date DESC
    `.catch(() => []),
  ]);

  const events: CalendarEventItem[] = [];

  // Map posts (blogs & journals)
  for (const p of postsRes) {
    const rawDate = p.published_at || p.created_at;
    if (rawDate) {
      events.push({
        id: `post-${p.id}`,
        title: p.title_en || "Untitled Article",
        date: new Date(rawDate).toISOString(),
        type: p.post_type === "journal" ? "journal" : "blog",
        status: p.status as "published" | "scheduled" | "draft",
        slug: p.slug,
        coverImage: p.cover_image_url,
      });
    }
  }

  // Map dev logs
  for (const log of logsRes) {
    if (log.log_date) {
      events.push({
        id: `log-${log.id}`,
        title: log.title || "Daily Dev Log",
        date: new Date(log.log_date).toISOString(),
        type: "journal",
        status: "published",
        mood: log.mood,
      });
    }
  }

  return <CalendarClient initialEvents={events} />;
}
