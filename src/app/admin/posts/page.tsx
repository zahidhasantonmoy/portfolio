import { sql } from "@/lib/db";
import Link from "next/link";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  let posts;
  if (status) {
    posts = await sql`
      SELECT p.id, p.title_en, p.slug, p.status, p.post_type, p.published_at, p.created_at, c.name_en as cat_name
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = ${status}
      ORDER BY p.created_at DESC
    `;
  } else {
    posts = await sql`
      SELECT p.id, p.title_en, p.slug, p.status, p.post_type, p.published_at, p.created_at, c.name_en as cat_name
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `;
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
          <p className="text-gray-400 text-sm mt-1">{posts?.length ?? 0} total</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition"
        >
          + New Post
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {["all", "published", "draft", "scheduled"].map((s) => (
          <Link
            key={s}
            href={s === "all" ? "/admin/posts" : `/admin/posts?status=${s}`}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition ${
              (s === "all" ? !status : status === s)
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {/* Posts Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {(posts ?? []).length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-gray-400">No posts yet</p>
            <Link href="/admin/posts/new" className="mt-3 inline-block text-sm text-indigo-400 hover:text-indigo-300">
              Create your first post →
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-medium uppercase">Title</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {(posts ?? []).map((post: any) => (
                <tr key={post.id} className="hover:bg-gray-800/50 transition">
                  <td className="px-6 py-4">
                    <p className="text-sm text-white font-medium">{post.title_en}</p>
                    <p className="text-xs text-gray-500 mt-0.5">/blog/{post.slug}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs text-gray-400 capitalize">{post.post_type}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                      post.status === "published"
                        ? "bg-emerald-900/40 text-emerald-400"
                        : post.status === "scheduled"
                        ? "bg-blue-900/40 text-blue-400"
                        : "bg-yellow-900/40 text-yellow-400"
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs text-gray-500">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("en-BD")
                        : new Date(post.created_at).toLocaleDateString("en-BD")}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="text-xs text-gray-500 hover:text-gray-300"
                      >
                        View ↗
                      </Link>
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
