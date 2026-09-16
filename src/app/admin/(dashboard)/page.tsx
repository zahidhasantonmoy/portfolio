import { sql } from "@/lib/db";
import AnalyticsClient, {
  PostAnalyticsItem,
  CategoryAnalyticsItem,
  RecentMessageItem,
  RecentSubscriberItem,
} from "./AnalyticsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboard() {
  // Ensure views & likes columns exist safely
  try {
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0`;
  } catch {
    // ignore
  }

  // Fetch all metrics concurrently
  const [
    postsRows,
    draftsRows,
    journalRows,
    subscribersRows,
    unreadMessagesRows,
    engagementRows,
    allPostsRows,
    categoriesRows,
    recentMessagesRows,
    recentSubscribersRows,
  ] = await Promise.all([
    sql`SELECT count(*) as count FROM posts WHERE status = 'published'`.catch(() => [{ count: 0 }]),
    sql`SELECT count(*) as count FROM posts WHERE status = 'draft'`.catch(() => [{ count: 0 }]),
    sql`SELECT count(*) as count FROM development_logs`.catch(() => [{ count: 0 }]),
    sql`SELECT count(*) as count FROM subscribers WHERE status = 'active'`.catch(() => [{ count: 0 }]),
    sql`SELECT count(*) as count FROM contact_messages WHERE status = 'unread'`.catch(() => [{ count: 0 }]),
    sql`SELECT COALESCE(SUM(views), 0) as total_views, COALESCE(SUM(likes), 0) as total_likes FROM posts`.catch(() => [{ total_views: 0, total_likes: 0 }]),
    sql`
      SELECT p.id, p.title_en, p.title_bn, p.slug, p.post_type, p.status, p.read_time_min,
             COALESCE(p.views, 0) as views, COALESCE(p.likes, 0) as likes,
             p.published_at, p.created_at,
             c.name_en as category_name, c.color as category_color
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.views DESC NULLS LAST, p.created_at DESC
    `.catch(() => []),
    sql`
      SELECT c.name_en as name, c.color, count(p.id) as post_count,
             COALESCE(SUM(p.views), 0) as total_views,
             COALESCE(SUM(p.likes), 0) as total_likes
      FROM categories c
      LEFT JOIN posts p ON c.id = p.category_id AND p.status = 'published'
      GROUP BY c.id, c.name_en, c.color
      ORDER BY total_views DESC
    `.catch(() => []),
    sql`
      SELECT id, name, email, message, status, created_at
      FROM contact_messages
      ORDER BY created_at DESC
      LIMIT 6
    `.catch(() => []),
    sql`
      SELECT id, email, status, subscribed_at
      FROM subscribers
      ORDER BY subscribed_at DESC
      LIMIT 6
    `.catch(() => []),
  ]);

  const totalViews = Number(engagementRows[0]?.total_views ?? 0);
  const totalLikes = Number(engagementRows[0]?.total_likes ?? 0);
  const totalPublished = Number(postsRows[0]?.count ?? 0);
  const totalDrafts = Number(draftsRows[0]?.count ?? 0);
  const totalDevLogs = Number(journalRows[0]?.count ?? 0);
  const totalSubscribers = Number(subscribersRows[0]?.count ?? 0);
  const unreadMessagesCount = Number(unreadMessagesRows[0]?.count ?? 0);

  const posts: PostAnalyticsItem[] = (allPostsRows || []).map((row: any) => ({
    id: row.id,
    title_en: row.title_en,
    title_bn: row.title_bn || null,
    slug: row.slug,
    post_type: row.post_type,
    status: row.status,
    read_time_min: Number(row.read_time_min || 3),
    views: Number(row.views || 0),
    likes: Number(row.likes || 0),
    published_at: row.published_at ? new Date(row.published_at).toISOString() : null,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    category_name: row.category_name || null,
    category_color: row.category_color || null,
  }));

  const categories: CategoryAnalyticsItem[] = (categoriesRows || []).map((row: any) => ({
    name: row.name,
    color: row.color || "#6366f1",
    post_count: Number(row.post_count || 0),
    total_views: Number(row.total_views || 0),
    total_likes: Number(row.total_likes || 0),
  }));

  const recentMessages: RecentMessageItem[] = (recentMessagesRows || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    status: row.status,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  }));

  const recentSubscribers: RecentSubscriberItem[] = (recentSubscribersRows || []).map((row: any) => ({
    id: row.id,
    email: row.email,
    status: row.status,
    subscribed_at: row.subscribed_at ? new Date(row.subscribed_at).toISOString() : new Date().toISOString(),
  }));

  return (
    <AnalyticsClient
      posts={posts}
      categories={categories}
      recentMessages={recentMessages}
      recentSubscribers={recentSubscribers}
      totalPublished={totalPublished}
      totalDrafts={totalDrafts}
      totalDevLogs={totalDevLogs}
      totalSubscribers={totalSubscribers}
      unreadMessagesCount={unreadMessagesCount}
      totalViews={totalViews}
      totalLikes={totalLikes}
    />
  );
}
