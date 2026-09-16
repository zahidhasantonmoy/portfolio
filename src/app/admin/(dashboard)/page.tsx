import { sql } from "@/lib/db";
import Link from "next/link";
import { FaEye, FaHeart, FaBookOpen, FaChartLine } from "react-icons/fa";

export default async function AdminDashboard() {
  // Ensure views & likes columns exist safely
  try {
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0`;
  } catch (e) {
    // Ignore if already existing
  }

  // Stats
  const [
    postsRows,
    draftsRows,
    journalRows,
    subscribersRows,
    unreadMessagesRows,
    engagementRows,
    topPostsRows,
  ] = await Promise.all([
    sql`SELECT count(*) as count FROM posts WHERE status = 'published'`,
    sql`SELECT count(*) as count FROM posts WHERE status = 'draft'`,
    sql`SELECT count(*) as count FROM development_logs`,
    sql`SELECT count(*) as count FROM subscribers WHERE status = 'active'`,
    sql`SELECT count(*) as count FROM contact_messages WHERE status = 'unread'`.catch(() => [{ count: 0 }]),
    sql`SELECT COALESCE(SUM(views), 0) as total_views, COALESCE(SUM(likes), 0) as total_likes FROM posts`.catch(() => [{ total_views: 0, total_likes: 0 }]),
    sql`SELECT id, title_en, slug, COALESCE(views, 0) as views, COALESCE(likes, 0) as likes, read_time_min, published_at FROM posts WHERE status = 'published' ORDER BY views DESC NULLS LAST LIMIT 5`.catch(() => []),
  ]);

  const totalViews = Number(engagementRows[0]?.total_views ?? 0);
  const totalLikes = Number(engagementRows[0]?.total_likes ?? 0);

  const stats = [
    { label: "Published Posts", value: postsRows[0]?.count ?? 0, icon: "📝", color: "indigo", href: "/admin/posts" },
    { label: "Drafts", value: draftsRows[0]?.count ?? 0, icon: "📄", color: "yellow", href: "/admin/posts?status=draft" },
    { label: "Total Views", value: totalViews.toLocaleString(), icon: "👁️", color: "blue", href: "/admin/posts" },
    { label: "Reader Claps", value: totalLikes.toLocaleString(), icon: "👏", color: "rose", href: "/admin/posts" },
    { label: "Subscribers", value: subscribersRows[0]?.count ?? 0, icon: "📧", color: "pink", href: "/admin/subscribers" },
  ];

  // Recent posts
  const recentPosts = await sql`
    SELECT id, title_en, slug, status, published_at, created_at, post_type,
           COALESCE(views, 0) as views, COALESCE(likes, 0) as likes
    FROM posts
    ORDER BY created_at DESC
    LIMIT 5
  `;

  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-600/20 text-indigo-400",
    yellow: "bg-yellow-600/20 text-yellow-400",
    emerald: "bg-emerald-600/20 text-emerald-400",
    pink: "bg-pink-600/20 text-pink-400",
    blue: "bg-blue-600/20 text-blue-400",
    rose: "bg-rose-600/20 text-rose-400",
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard & Analytics</h1>
        <p className="text-gray-400 mt-1">Welcome back, Zahid! Here is how your portfolio is performing. 👋</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5 hover:border-gray-700 transition group">
            <div className={`inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg mb-2 sm:mb-3 text-lg sm:text-xl ${colorMap[stat.color]}`}>
              {stat.icon}
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Top Read / Most Viewed Posts Analytics Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaChartLine className="text-indigo-400" />
            <h2 className="font-semibold text-white text-sm sm:text-base">Top Read & Most Viewed Posts</h2>
          </div>
          <span className="text-[11px] sm:text-xs text-gray-500">Live audience metrics</span>
        </div>

        {(!topPostsRows || topPostsRows.length === 0) ? (
          <p className="text-gray-500 text-sm py-4 text-center">No views recorded yet.</p>
        ) : (
          <div className="divide-y divide-gray-800">
            {topPostsRows.map((post: any, index: number) => (
              <div key={post.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 text-center text-xs font-bold text-gray-500 flex-shrink-0">
                    #{index + 1}
                  </span>
                  <div className="truncate">
                    <p className="text-sm text-white font-medium truncate">{post.title_en}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">/blog/{post.slug}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-6 flex-shrink-0 text-xs pl-9 sm:pl-0">
                  <div className="flex items-center gap-1.5 text-indigo-300 font-medium">
                    <FaEye className="text-indigo-400 text-xs" />
                    <span>{Number(post.views || 0).toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-300 font-medium">
                    <FaHeart className="text-rose-400 text-xs" />
                    <span>{Number(post.likes || 0).toLocaleString()} claps</span>
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
                  >
                    View ↗
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/posts/new"
          className="flex items-center gap-3 p-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition">
          <span className="text-2xl">✏️</span>
          <div>
            <p className="font-semibold text-white">New Blog Post</p>
            <p className="text-indigo-200 text-sm">Write a technical article</p>
          </div>
        </Link>
        <Link href="/admin/journal/new"
          className="flex items-center gap-3 p-4 bg-emerald-700 hover:bg-emerald-600 rounded-xl transition">
          <span className="text-2xl">📓</span>
          <div>
            <p className="font-semibold text-white">New Journal Entry</p>
            <p className="text-emerald-200 text-sm">Log today&apos;s learning</p>
          </div>
        </Link>
      </div>

      {/* Recent Posts */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Recent Posts</h2>
          <Link href="/admin/posts" className="text-sm text-indigo-400 hover:text-indigo-300">
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {(recentPosts ?? []).length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">
              No posts yet. <Link href="/admin/posts/new" className="text-indigo-400">Create your first post →</Link>
            </p>
          ) : (
            (recentPosts ?? []).map((post: any) => (
              <div key={post.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-sm text-white font-medium truncate max-w-xs">{post.title_en}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {post.post_type === "journal" ? "📓 Journal" : "📝 Blog"} •{" "}
                    {post.published_at ? new Date(post.published_at).toLocaleDateString("en-BD") : "Not published"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>👁️ {post.views}</span>
                    <span>👏 {post.likes}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    post.status === "published"
                      ? "bg-emerald-900/40 text-emerald-400"
                      : "bg-yellow-900/40 text-yellow-400"
                  }`}>
                    {post.status}
                  </span>
                  <Link href={`/admin/posts/${post.id}/edit`}
                    className="text-xs text-indigo-400 hover:text-indigo-300">
                    Edit
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
