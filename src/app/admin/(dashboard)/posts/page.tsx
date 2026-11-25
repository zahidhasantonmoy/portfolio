import { sql } from "@/lib/db";
import Link from "next/link";
import PostStatusToggle from "./PostStatusToggle";
import DeletePostButton from "./DeletePostButton";
import { FaEye, FaHeart } from "react-icons/fa";

const PAGE_SIZE = 20;
const STATUS_TABS = ["all", "published", "draft", "scheduled"] as const;

type SearchParams = {
  status?: string;
  q?: string;
  category?: string;
  page?: string;
};

/** Build a /admin/posts link preserving the current filters, with overrides. */
function buildHref(
  base: { status?: string; q?: string; category?: string },
  overrides: { status?: string | null; q?: string | null; category?: string | null; page?: number | null } = {}
) {
  const params = new URLSearchParams();
  const status = overrides.status !== undefined ? overrides.status : base.status;
  const q = overrides.q !== undefined ? overrides.q : base.q;
  const category = overrides.category !== undefined ? overrides.category : base.category;
  const page = overrides.page !== undefined ? overrides.page : null;
  if (status && status !== "all") params.set("status", status);
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/posts?${query}` : "/admin/posts";
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { status, q, category, page } = await searchParams;
  const search = (q ?? "").trim();
  const statusFilter =
    status && status !== "all" && ["published", "draft", "scheduled"].includes(status)
      ? status
      : null;
  const categoryFilter = (category ?? "").trim() || null;
  // Only accept a UUID-shaped category id — anything else would make the
  // ::uuid cast in the query below throw and 500 the page.
  const categoryId =
    categoryFilter && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryFilter)
      ? categoryFilter
      : null;
  const searchPattern = search ? `%${search}%` : null;
  const currentPage = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);

  const categories = await sql`
    SELECT id, name_en FROM categories ORDER BY name_en ASC
  `;

  const whereArgs = {
    status: statusFilter,
    search: searchPattern,
    category: categoryId,
  };

  const totalRows = await sql`
    SELECT COUNT(*)::int as count FROM posts p
    WHERE (${whereArgs.status}::text IS NULL OR p.status = ${whereArgs.status})
      AND (${whereArgs.search}::text IS NULL
        OR p.title_en ILIKE ${whereArgs.search}
        OR p.title_bn ILIKE ${whereArgs.search}
        OR p.slug ILIKE ${whereArgs.search}
        OR p.excerpt_en ILIKE ${whereArgs.search})
      AND (${whereArgs.category}::uuid IS NULL OR p.category_id = ${whereArgs.category})
  `;
  const total = Number(totalRows[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const safeOffset = (safePage - 1) * PAGE_SIZE;

  const posts = await sql`
    SELECT p.id, p.title_en, p.slug, p.status, p.post_type, p.published_at, p.created_at,
           COALESCE(p.views, 0) as views, COALESCE(p.likes, 0) as likes, p.read_time_min,
           c.name_en as cat_name
    FROM posts p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE (${whereArgs.status}::text IS NULL OR p.status = ${whereArgs.status})
      AND (${whereArgs.search}::text IS NULL
        OR p.title_en ILIKE ${whereArgs.search}
        OR p.title_bn ILIKE ${whereArgs.search}
        OR p.slug ILIKE ${whereArgs.search}
        OR p.excerpt_en ILIKE ${whereArgs.search})
      AND (${whereArgs.category}::uuid IS NULL OR p.category_id = ${whereArgs.category})
    ORDER BY p.created_at DESC
    LIMIT ${PAGE_SIZE} OFFSET ${safeOffset}
  `;

  const base = { status: statusFilter ?? undefined, q: search || undefined, category: categoryId ?? undefined };
  const showingFrom = total === 0 ? 0 : safeOffset + 1;
  const showingTo = Math.min(total, safeOffset + (posts?.length ?? 0));

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="font-mono text-[11px] tracking-[0.12em] text-cyan uppercase">Admin · Blog</p>
          <h1 className="text-2xl font-bold text-ink font-display">Blog Posts</h1>
          <p className="text-ink-mute text-sm mt-1">
            {total === 0
              ? "No posts match these filters"
              : `Showing ${showingFrom}–${showingTo} of ${total} post${total === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="self-start sm:self-auto px-4 py-2 bg-cyan text-[#060a13] text-sm font-bold rounded-lg transition hover:bg-amber active:scale-95"
        >
          + New Post
        </Link>
      </div>

      {/* Search + category filter (server-side, via query params) */}
      <form action="/admin/posts" method="get" className="flex flex-col sm:flex-row gap-2 mb-4">
        {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Search by title, slug or excerpt…"
          aria-label="Search posts"
          className="flex-1 px-3.5 py-2 bg-card border border-line-soft rounded-lg text-sm text-ink placeholder:text-ink-mute focus:outline-none focus:border-cyan"
        />
        <select
          name="category"
          defaultValue={categoryFilter ?? ""}
          aria-label="Filter by category"
          className="px-3 py-2 bg-card border border-line-soft rounded-lg text-sm text-ink focus:outline-none focus:border-cyan"
        >
          <option value="">All categories</option>
          {(categories ?? []).map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name_en}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-card2 border border-line text-sm font-semibold text-ink rounded-lg transition hover:border-cyan hover:text-cyan"
        >
          Search
        </button>
        {(search || categoryFilter) && (
          <Link
            href={buildHref({ status: statusFilter ?? undefined })}
            className="px-4 py-2 text-sm text-ink-mute hover:text-ink text-center transition"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Filter tabs — keep ?status= behaviour; other filters are preserved */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_TABS.map((s) => (
          <Link
            key={s}
            href={buildHref(base, { status: s === "all" ? null : s, page: null })}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize whitespace-nowrap transition ${
              (s === "all" ? !statusFilter : statusFilter === s)
                ? "bg-cyan text-[#060a13] font-bold"
                : "bg-card border border-line-soft text-ink-mute hover:text-ink"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {/* Posts Table */}
      <div className="bg-card border border-line-soft rounded-xl overflow-hidden">
        {(posts ?? []).length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-ink-mute">
              {search || categoryFilter || statusFilter ? "No posts match these filters" : "No posts yet"}
            </p>
            <Link href="/admin/posts/new" className="mt-3 inline-block text-sm text-cyan hover:text-amber">
              Create your first post →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-line-soft">
                  <th className="text-left px-6 py-3 text-xs text-ink-mute font-medium uppercase">Title</th>
                  <th className="text-left px-4 py-3 text-xs text-ink-mute font-medium uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs text-ink-mute font-medium uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-ink-mute font-medium uppercase">Engagement</th>
                  <th className="text-left px-4 py-3 text-xs text-ink-mute font-medium uppercase">Read</th>
                  <th className="text-left px-4 py-3 text-xs text-ink-mute font-medium uppercase">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {(posts ?? []).map((post: any) => (
                  <tr key={post.id} className="hover:bg-card2/60 transition">
                    <td className="px-6 py-4">
                      <p className="text-sm text-ink font-medium">{post.title_en}</p>
                      <p className="text-xs text-ink-mute mt-0.5">/blog/{post.slug}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-ink-soft capitalize">{post.post_type}</span>
                    </td>
                    <td className="px-4 py-4">
                      <PostStatusToggle postId={post.id} initialStatus={post.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3 text-xs text-ink-soft">
                        <span className="flex items-center gap-1">
                          <FaEye className="text-cyan text-[11px]" />
                          {post.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaHeart className="text-rose-400 text-[11px]" />
                          {post.likes}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-ink-mute">
                        {post.read_time_min ? `${post.read_time_min} min` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-ink-mute">
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
                          className="text-xs text-ink-mute hover:text-ink"
                        >
                          View ↗
                        </Link>
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="text-xs text-cyan hover:text-amber"
                        >
                          Edit
                        </Link>
                        <DeletePostButton postId={post.id} postTitle={post.title_en} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-between mt-5" aria-label="Posts pagination">
          {safePage > 1 ? (
            <Link
              href={buildHref(base, { page: safePage - 1 })}
              className="px-3.5 py-2 bg-card border border-line-soft rounded-lg text-sm text-ink-soft transition hover:border-cyan hover:text-cyan"
            >
              ← Prev
            </Link>
          ) : (
            <span className="px-3.5 py-2 text-sm text-ink-mute opacity-50">← Prev</span>
          )}
          <span className="text-xs text-ink-mute font-mono">
            Page {safePage} of {totalPages}
          </span>
          {safePage < totalPages ? (
            <Link
              href={buildHref(base, { page: safePage + 1 })}
              className="px-3.5 py-2 bg-card border border-line-soft rounded-lg text-sm text-ink-soft transition hover:border-cyan hover:text-cyan"
            >
              Next →
            </Link>
          ) : (
            <span className="px-3.5 py-2 text-sm text-ink-mute opacity-50">Next →</span>
          )}
        </nav>
      )}
    </div>
  );
}
