"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaEye,
  FaHeart,
  FaBookOpen,
  FaChartLine,
  FaSearch,
  FaSyncAlt,
  FaArrowUp,
  FaFire,
  FaTags,
  FaUserFriends,
  FaEnvelope,
  FaExternalLinkAlt,
  FaEdit,
  FaFilter,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

export interface PostAnalyticsItem {
  id: string;
  title_en: string;
  title_bn: string | null;
  slug: string;
  post_type: "blog" | "journal";
  status: "published" | "draft" | "scheduled";
  read_time_min: number;
  views: number;
  likes: number;
  published_at: string | null;
  created_at: string;
  category_name: string | null;
  category_color: string | null;
}

export interface CategoryAnalyticsItem {
  name: string;
  color: string;
  post_count: number;
  total_views: number;
  total_likes: number;
}

export interface RecentMessageItem {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
}

export interface RecentSubscriberItem {
  id: string;
  email: string;
  status: string;
  subscribed_at: string;
}

export interface AnalyticsProps {
  posts: PostAnalyticsItem[];
  categories: CategoryAnalyticsItem[];
  recentMessages: RecentMessageItem[];
  recentSubscribers: RecentSubscriberItem[];
  totalPublished: number;
  totalDrafts: number;
  totalDevLogs: number;
  totalSubscribers: number;
  unreadMessagesCount: number;
  totalViews: number;
  totalLikes: number;
}

export default function AnalyticsClient({
  posts,
  categories,
  recentMessages,
  recentSubscribers,
  totalPublished,
  totalDrafts,
  totalDevLogs,
  totalSubscribers,
  unreadMessagesCount,
  totalViews,
  totalLikes,
}: AnalyticsProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "blog" | "journal">("all");
  const [sortBy, setSortBy] = useState<"views" | "likes" | "date">("views");
  const [activityTab, setActivityTab] = useState<"messages" | "subscribers">("messages");

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Engagement stats
  const avgViewsPerPost = totalPublished > 0 ? Math.round(totalViews / totalPublished) : 0;
  const overallEngagementRate = totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(1) : "0.0";

  // Top 5 posts for visual bar chart
  const top5Posts = useMemo(() => {
    return [...posts]
      .filter((p) => p.status === "published")
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  }, [posts]);

  const maxViewsInTop5 = useMemo(() => {
    if (top5Posts.length === 0) return 1;
    return Math.max(...top5Posts.map((p) => p.views), 1);
  }, [top5Posts]);

  // Filtered & sorted posts list for table
  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        if (typeFilter !== "all" && post.post_type !== typeFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          post.title_en.toLowerCase().includes(q) ||
          (post.title_bn && post.title_bn.toLowerCase().includes(q)) ||
          post.slug.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "views") return b.views - a.views;
        if (sortBy === "likes") return b.likes - a.likes;
        return new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime();
      });
  }, [posts, typeFilter, searchQuery, sortBy]);

  return (
    <div className="max-w-6xl space-y-8 pb-10">
      {/* Header & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Live Visitor &amp; Post Analytics
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live Sync
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Real-time traffic metrics, reader engagement, and content performance across your portfolio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 transition active:scale-95 shadow-sm"
          >
            <FaSyncAlt className={`text-xs text-indigo-400 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Refresh Data"}</span>
          </button>

          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition active:scale-95"
          >
            <HiSparkles className="text-sm" />
            <span>New Post</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Views */}
        <div className="bg-gray-900/90 border border-indigo-500/20 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-indigo-500/40 transition">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm mb-2.5">
            <FaEye />
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">{totalViews.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">Total Post Views</p>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400">
            <FaArrowUp className="text-[9px]" />
            <span>Avg {avgViewsPerPost} / post</span>
          </div>
        </div>

        {/* Reader Claps */}
        <div className="bg-gray-900/90 border border-rose-500/20 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-rose-500/40 transition">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center text-sm mb-2.5">
            <FaHeart />
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">{totalLikes.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">Reader Claps</p>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-rose-300">
            <span>{overallEngagementRate}% clap rate</span>
          </div>
        </div>

        {/* Published Posts */}
        <div className="bg-gray-900/90 border border-blue-500/20 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-blue-500/40 transition">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-sm mb-2.5">
            <FaBookOpen />
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">{totalPublished}</p>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">Live Articles</p>
          <div className="mt-2 text-[10px] text-gray-500">
            <span>+{totalDrafts} drafts pending</span>
          </div>
        </div>

        {/* Dev Journal Logs */}
        <div className="bg-gray-900/90 border border-emerald-500/20 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm mb-2.5">
            <FaChartLine />
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">{totalDevLogs}</p>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">Journal Entries</p>
          <div className="mt-2 text-[10px] text-emerald-400/80">
            <span>Daily dev logs</span>
          </div>
        </div>

        {/* Newsletter Subscribers */}
        <div className="bg-gray-900/90 border border-purple-500/20 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-purple-500/40 transition">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-sm mb-2.5">
            <FaUserFriends />
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">{totalSubscribers}</p>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">Subscribers</p>
          <div className="mt-2 text-[10px] text-purple-300">
            <span>Active readers</span>
          </div>
        </div>

        {/* Inquiries / Unread Leads */}
        <div className="bg-gray-900/90 border border-amber-500/20 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm mb-2.5">
            <FaEnvelope />
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">{unreadMessagesCount}</p>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">Unread Leads</p>
          <div className="mt-2 text-[10px] text-amber-400">
            <span>Contact inquiries</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Row: Top 5 Posts Bar Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Most Read Posts Visual Bar Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <FaFire className="text-amber-400 text-sm" />
              <h2 className="font-bold text-white text-base">Top 5 Most Read Articles</h2>
            </div>
            <span className="text-xs text-gray-500">Ranked by verified view counts</span>
          </div>

          {top5Posts.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">No posts with view records yet.</p>
          ) : (
            <div className="space-y-4">
              {top5Posts.map((post, idx) => {
                const percentage = Math.round((post.views / maxViewsInTop5) * 100);
                return (
                  <div key={post.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 h-5 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          #{idx + 1}
                        </span>
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="text-white hover:text-indigo-400 font-medium truncate transition"
                        >
                          {post.title_en}
                        </Link>
                        {post.category_name && (
                          <span
                            className="text-[10px] px-1.5 py-0.2 rounded font-medium truncate hidden sm:inline"
                            style={{
                              backgroundColor: `${post.category_color || "#6366f1"}20`,
                              color: post.category_color || "#818cf8",
                            }}
                          >
                            {post.category_name}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0 text-[11px] font-mono">
                        <span className="text-indigo-300 font-semibold">{post.views.toLocaleString()} views</span>
                        <span className="text-rose-400 hidden xs:inline">{post.likes.toLocaleString()} claps</span>
                      </div>
                    </div>

                    {/* Visual Bar with Gradient Fill */}
                    <div className="w-full bg-gray-800/80 rounded-full h-2.5 overflow-hidden relative">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category & Topic Distribution (1 Col) */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <FaTags className="text-indigo-400 text-sm" />
                <h2 className="font-bold text-white text-base">Category Performance</h2>
              </div>
              <span className="text-xs text-gray-500">{categories.length} topics</span>
            </div>

            <div className="space-y-3.5">
              {categories.slice(0, 5).map((cat) => {
                const totalCatViews = Number(cat.total_views || 0);
                const sharePercent = totalViews > 0 ? Math.round((totalCatViews / totalViews) * 100) : 0;
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300 font-medium truncate">{cat.name}</span>
                      <span className="text-gray-400 font-mono text-[11px]">{totalCatViews.toLocaleString()} views ({sharePercent}%)</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(sharePercent, 3)}%`,
                          backgroundColor: cat.color || "#6366f1",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
            <span>Tech focus: Next.js, MERN, AI</span>
            <Link href="/admin/posts" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Manage Posts →
            </Link>
          </div>
        </div>
      </div>

      {/* Comprehensive Post Performance Table with Search & Sort */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-gray-800">
          <div>
            <h2 className="font-bold text-white text-lg">All Posts Engagement Breakdown</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Filter by type, search titles, or sort by engagement metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Box */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search post title..."
                className="bg-gray-800/80 border border-gray-700 text-white placeholder-gray-500 text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-indigo-500 transition w-44 sm:w-56"
              />
            </div>

            {/* Type Filter Buttons */}
            <div className="flex rounded-xl bg-gray-800/80 p-0.5 border border-gray-700 text-xs">
              <button
                type="button"
                onClick={() => setTypeFilter("all")}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  typeFilter === "all" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("blog")}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  typeFilter === "blog" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                Blogs
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("journal")}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  typeFilter === "journal" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                Journals
              </button>
            </div>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort articles by"
              className="bg-gray-800/80 border border-gray-700 text-gray-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="views">Sort by Views</option>
              <option value="likes">Sort by Claps</option>
              <option value="date">Sort by Date</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Article</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Views</th>
                <th className="py-2.5 px-3 text-right">Claps</th>
                <th className="py-2.5 px-3 text-right">Engagement</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No articles match your query.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => {
                  const engagement = post.views > 0 ? ((post.likes / post.views) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={post.id} className="hover:bg-gray-800/40 transition group">
                      <td className="py-3 px-3">
                        <p className="font-semibold text-white truncate max-w-xs sm:max-w-md">
                          {post.title_en}
                        </p>
                        <p className="text-[11px] text-gray-500 font-mono truncate">
                          /{post.post_type === "journal" ? "journal" : "blog"}/{post.slug}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          post.post_type === "journal" ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30" : "bg-indigo-950/60 text-indigo-300 border border-indigo-500/30"
                        }`}>
                          {post.post_type}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {post.category_name ? (
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-medium"
                            style={{
                              backgroundColor: `${post.category_color || "#6366f1"}20`,
                              color: post.category_color || "#818cf8",
                            }}
                          >
                            {post.category_name}
                          </span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-medium text-indigo-300">
                        {post.views.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-medium text-rose-300">
                        {post.likes.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-gray-400">
                        <span className={Number(engagement) >= 5 ? "text-emerald-400 font-semibold" : ""}>
                          {engagement}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/${post.post_type === "journal" ? "journal" : "blog"}/${post.slug}`}
                            target="_blank"
                            title="View post on site"
                            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition"
                          >
                            <FaExternalLinkAlt className="text-[10px]" />
                          </Link>
                          <Link
                            href={`/admin/posts/${post.id}/edit`}
                            title="Edit post"
                            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-indigo-400 hover:text-indigo-300 transition"
                          >
                            <FaEdit className="text-[10px]" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Activity Feed: Messages & Subscribers */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-base">⚡</span>
            <h2 className="font-bold text-white text-base">Community Activity Feed</h2>
          </div>

          <div className="flex rounded-xl bg-gray-800 p-0.5 border border-gray-700 text-xs">
            <button
              type="button"
              onClick={() => setActivityTab("messages")}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                activityTab === "messages" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Inquiries ({recentMessages.length})
            </button>
            <button
              type="button"
              onClick={() => setActivityTab("subscribers")}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                activityTab === "subscribers" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Subscribers ({recentSubscribers.length})
            </button>
          </div>
        </div>

        {activityTab === "messages" ? (
          <div className="space-y-3">
            {recentMessages.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">No contact inquiries yet.</p>
            ) : (
              recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3 rounded-xl bg-gray-800/40 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white truncate">{msg.name}</span>
                      <span className="text-gray-500 truncate font-mono text-[11px]">&lt;{msg.email}&gt;</span>
                      <span className={`text-[10px] px-2 py-0.2 rounded-full font-medium ${
                        msg.status === "unread" ? "bg-amber-950/60 text-amber-400 border border-amber-500/40" : "bg-gray-700 text-gray-300"
                      }`}>
                        {msg.status}
                      </span>
                    </div>
                    <p className="text-gray-400 mt-1 line-clamp-1 italic">&ldquo;{msg.message}&rdquo;</p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 text-[11px] text-gray-500">
                    <span>{new Date(msg.created_at).toLocaleDateString("en-BD", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    <Link
                      href="/admin/messages"
                      className="text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Reply →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {recentSubscribers.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">No subscribers yet.</p>
            ) : (
              recentSubscribers.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 rounded-xl bg-gray-800/40 border border-gray-800 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="font-semibold text-white truncate">{sub.email}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">
                      {sub.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-500 flex-shrink-0">
                    {new Date(sub.subscribed_at).toLocaleDateString("en-BD", { month: "short", day: "numeric" })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
