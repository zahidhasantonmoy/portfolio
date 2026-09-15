import { sql } from "@/lib/db";
import Link from "next/link";

export default async function AdminDashboard() {
  // Stats
  const [postsRows, draftsRows, journalRows, subscribersRows] = await Promise.all([
    sql`SELECT count(*) as count FROM posts WHERE status = 'published'`,
    sql`SELECT count(*) as count FROM posts WHERE status = 'draft'`,
    sql`SELECT count(*) as count FROM development_logs`,
    sql`SELECT count(*) as count FROM subscribers WHERE status = 'active'`,
  ]);

  const stats = [
    { label: "Published Posts", value: postsRows[0]?.count ?? 0, icon: "📝", color: "indigo", href: "/admin/posts" },
    { label: "Drafts", value: draftsRows[0]?.count ?? 0, icon: "📄", color: "yellow", href: "/admin/posts?status=draft" },
    { label: "Journal Entries", value: journalRows[0]?.count ?? 0, icon: "📓", color: "emerald", href: "/admin/journal" },
    { label: "Subscribers", value: subscribersRows[0]?.count ?? 0, icon: "📧", color: "pink", href: "/admin/subscribers" },
  ];

  // Recent posts
  const recentPosts = await sql`
    SELECT id, title_en, slug, status, published_at, created_at, post_type
    FROM posts
    ORDER BY created_at DESC
    LIMIT 5
  `;

  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-600/20 text-indigo-400",
    yellow: "bg-yellow-600/20 text-yellow-400",
    emerald: "bg-emerald-600/20 text-emerald-400",
    pink: "bg-pink-600/20 text-pink-400",
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back, Zahid! 👋</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition group">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 text-xl ${colorMap[stat.color]}`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
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
                <div className="flex items-center gap-3">
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
