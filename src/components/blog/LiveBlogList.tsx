"use client";

import { useState, useEffect, useCallback, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiX } from "react-icons/fi";
import type { Post, Category, Tag } from "@/types/blog";
import BlogCard from "./BlogCard";

interface LiveBlogListProps {
  /** Server-filtered page of posts (the server owns category/search/tag/page). */
  initialPosts: Post[];
  categories: Category[];
  /** Live per-category counts (from getCategoryCounts); falls back to counting the page. */
  categoryCounts?: Record<string, number>;
  /** Real tags per post id (from getTagsForPostIds); cards show chips only when present. */
  postTags?: Record<string, Tag[]>;
  lang?: "en" | "bn";
  initialCategory?: string;
  initialSearch?: string;
  initialTag?: string;
  /** N for "SHOWING X OF N POSTS" — from the DB count query, never the page length. */
  totalCount: number;
  currentPage?: number;
  totalPages?: number;
  showPagination?: boolean;
  /** Where filter changes navigate ("/blog", "/bn/blog"). Home teaser uses "/blog". */
  basePath?: string;
}

/**
 * Redesign 4 blog list — presentational client component over server-filtered
 * posts. Search input + category chips + tag chip drive real server round-trips
 * (router.push + RSC) instead of in-memory filtering; the server owns the
 * filter state, so /blog?category=x&search=y&tag=z&page=n renders correctly
 * on first paint and without JS. Cards come from BlogCard in a responsive
 * grid; "SHOWING X OF N POSTS" uses the DB count query.
 */
export default function LiveBlogList({
  initialPosts,
  categories,
  categoryCounts: categoryCountsProp,
  postTags,
  lang = "en",
  initialCategory = "",
  initialSearch = "",
  initialTag = "",
  totalCount,
  currentPage = 1,
  totalPages = 1,
  showPagination = false,
  basePath = "/blog",
}: LiveBlogListProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Search input is local while typing; it is pushed to the server debounced.
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Keep the input in sync when the server state changes (e.g. back/forward,
  // or a filter reset from another control).
  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  const buildHref = useCallback(
    (overrides: {
      category?: string;
      search?: string;
      tag?: string;
      page?: number;
    }): string => {
      const params = new URLSearchParams();
      const cat =
        overrides.category !== undefined ? overrides.category : initialCategory;
      const q =
        overrides.search !== undefined ? overrides.search : initialSearch;
      const tag = overrides.tag !== undefined ? overrides.tag : initialTag;
      const page = overrides.page !== undefined ? overrides.page : currentPage;
      if (cat) params.set("category", cat);
      if (q && q.trim()) params.set("search", q.trim());
      if (tag) params.set("tag", tag);
      if (page && page > 1) params.set("page", String(page));
      const qs = params.toString();
      return qs ? `${basePath}?${qs}` : basePath;
    },
    [basePath, initialCategory, initialSearch, initialTag, currentPage]
  );

  const navigate = useCallback(
    (overrides: {
      category?: string;
      search?: string;
      tag?: string;
      page?: number;
    }) => {
      const href = buildHref(overrides);
      startTransition(() => {
        router.push(href);
      });
    },
    [buildHref, router]
  );

  // Debounced server search: typing updates the input immediately, the URL
  // (and therefore the server results) follow 600ms after the last keystroke.
  useEffect(() => {
    if (searchQuery === initialSearch) return;
    const timer = setTimeout(() => {
      navigate({ search: searchQuery, page: 1 });
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery, initialSearch, navigate]);

  const handleCategoryClick = (catSlug: string) => {
    // Clicking the active chip clears the category (page resets to 1).
    navigate({
      category: initialCategory === catSlug ? "" : catSlug,
      search: searchQuery,
      page: 1,
    });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    navigate({ search: "", page: 1 });
  };

  const handleClearTag = () => {
    navigate({ tag: "", page: 1 });
  };

  const handleResetAll = () => {
    setSearchQuery("");
    navigate({ category: "", search: "", tag: "", page: 1 });
  };

  // Base pool of posts for this language (server already enforces bnOnly on
  // the BN pages; this is a safety net so a BN-titled post never leaks in).
  const basePosts = useMemo(() => {
    if (lang === "bn") {
      return initialPosts.filter((p) => p.title_bn || p.content_bn);
    }
    return initialPosts;
  }, [initialPosts, lang]);

  // Category counts: live server counts when provided, else the page itself.
  const categoryCounts = useMemo(() => {
    if (categoryCountsProp) return categoryCountsProp;
    const counts: Record<string, number> = {};
    for (const cat of categories) counts[cat.slug] = 0;
    for (const post of basePosts) {
      if (post.categories?.slug && counts[post.categories.slug] !== undefined) {
        counts[post.categories.slug]++;
      }
    }
    return counts;
  }, [categories, basePosts, categoryCountsProp]);

  // Only categories that actually have posts in this language
  const visibleCategories = useMemo(
    () => categories.filter((cat) => (categoryCounts[cat.slug] ?? 0) > 0),
    [categories, categoryCounts]
  );

  // Display name of the active tag (looked up from the loaded tag chips).
  const activeTagName = useMemo(() => {
    if (!initialTag || !postTags) return initialTag;
    for (const tags of Object.values(postTags)) {
      const found = tags.find((t) => t.slug === initialTag);
      if (found) return lang === "bn" && found.name_bn ? found.name_bn : found.name_en;
    }
    return initialTag;
  }, [initialTag, postTags, lang]);

  const isFiltering = Boolean(initialCategory || initialSearch.trim() || initialTag);

  const t = {
    searchPlaceholder:
      lang === "bn"
        ? `${totalCount}টি পোস্ট খুঁজুন…`
        : `Search ${totalCount} posts…`,
    all: lang === "bn" ? "সব টপিক" : "All topics",
    showing: (count: number, total: number) =>
      lang === "bn"
        ? `মোট ${total}টির মধ্যে ${count}টি দেখানো হচ্ছে`
        : `SHOWING ${count} OF ${total} POSTS`,
    noResults:
      lang === "bn"
        ? "আপনার অনুসন্ধানের সাথে কোনো আর্টিকেল মেলেনি"
        : "No post matches that. Try a shorter word.",
    noPostsYet:
      lang === "bn" ? "এখনো কোনো পোস্ট প্রকাশিত হয়নি।" : "No posts published yet.",
    noPostsYetSub:
      lang === "bn"
        ? "নতুন আর্টিকেল প্রকাশিত হলে এখানে দেখা যাবে।"
        : "New articles will appear here once they are published.",
    tryAdjusting:
      lang === "bn"
        ? "বানান পরীক্ষা করুন বা অন্য কোনো কীওয়ার্ড দিয়ে চেষ্টা করুন।"
        : "Try adjusting your search terms or clearing the filters.",
    resetFilters: lang === "bn" ? "ফিল্টার রিসেট করুন" : "Reset all filters",
    tagLabel: lang === "bn" ? "ট্যাগ" : "Tag",
    prev: lang === "bn" ? "← আগের পাতা" : "← Previous",
    next: lang === "bn" ? "পরের পাতা →" : "Next →",
    pageLabel: (n: number) =>
      lang === "bn" ? `পাতা ${n}` : `Page ${n}`,
  };

  // Pagination window: up to 7 numbered buttons centred on the current page.
  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return [];
    const maxButtons = 7;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    const nums: number[] = [];
    for (let n = start; n <= end; n++) nums.push(n);
    return nums;
  }, [currentPage, totalPages]);

  return (
    <div>
      {/* Search + category chips — R4 .blog-tools */}
      <div className="blog-tools flex flex-wrap gap-[9px] items-center mt-[22px] mb-1">
        <div className="relative flex-[1_1_240px]">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={lang === "bn" ? "ব্লগ পোস্ট খুঁজুন" : "Search blog posts"}
            className="w-full min-h-[50px] px-4 py-3 text-base bg-[#0e1729] text-[#eef4ff] placeholder-[#a9bedd]/70 border-[1.5px] border-[#22345a] rounded-[14px] outline-none focus:border-[#2fd8f2] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              aria-label={lang === "bn" ? "খোঁজা মুছুন" : "Clear search"}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#a9bedd] hover:text-[#eef4ff] transition-colors"
            >
              <span className="w-5 h-5 rounded-full bg-[#122036] border border-[#22345a] flex items-center justify-center">
                <FiX className="w-3.5 h-3.5" />
              </span>
            </button>
          )}
        </div>

        {/* All topics chip */}
        <button
          type="button"
          onClick={() => handleCategoryClick("")}
          aria-pressed={!initialCategory}
          className={`min-h-[46px] px-[17px] py-[9px] font-extrabold text-[14.5px] cursor-pointer rounded-full border-[1.5px] transition-colors ${
            !initialCategory
              ? "bg-[#eef4ff] text-[#060a13] border-[#eef4ff]"
              : "bg-[#0e1729] text-[#c3d2ea] border-[#22345a] hover:border-[#0e7d99]"
          }`}
        >
          {t.all}
        </button>

        {/* Category chips — built from real DB categories, 0-post hidden */}
        {visibleCategories.map((cat) => {
          const isSelected = initialCategory === cat.slug;
          const catName =
            lang === "bn" && cat.name_bn ? cat.name_bn : cat.name_en;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat.slug)}
              aria-pressed={isSelected}
              className={`min-h-[46px] px-[17px] py-[9px] font-extrabold text-[14.5px] cursor-pointer rounded-full border-[1.5px] transition-colors ${
                isSelected
                  ? "bg-[#eef4ff] text-[#060a13] border-[#eef4ff]"
                  : "bg-[#0e1729] text-[#c3d2ea] border-[#22345a] hover:border-[#0e7d99]"
              }`}
            >
              {catName}
            </button>
          );
        })}
      </div>

      {/* Active tag chip (shown only when ?tag= is active) */}
      {initialTag && (
        <div className="flex items-center gap-2 mt-3">
          <span className="font-mono text-[12px] tracking-[0.09em] uppercase text-[#ffb02e]">
            {t.tagLabel}:
          </span>
          <button
            type="button"
            onClick={handleClearTag}
            aria-label={
              lang === "bn" ? `ট্যাগ ${activeTagName} সরান` : `Remove tag ${activeTagName}`
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ffb02e]/10 border-[1.5px] border-[#ffb02e]/40 text-[#ffb02e] text-[13px] font-bold hover:bg-[#ffb02e]/20 transition-colors"
          >
            #{activeTagName}
            <FiX className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Post cards — R4 grid via BlogCard */}
      {basePosts.length === 0 ? (
        <div className="text-center py-16 px-4 mt-[14px] bg-[#0e1729] border-[1.5px] border-dashed border-[#22345a] rounded-[16px]">
          <h3 className="text-lg font-bold text-[#eef4ff] mb-2">
            {isFiltering ? t.noResults : t.noPostsYet}
          </h3>
          <p className="text-[#a9bedd] text-sm max-w-md mx-auto mb-6">
            {isFiltering ? (
              <>
                {searchQuery ? `“${searchQuery}” — ` : ""}
                {t.tryAdjusting}
              </>
            ) : (
              t.noPostsYetSub
            )}
          </p>
          {isFiltering && (
            <button
              onClick={handleResetAll}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ffb02e] hover:bg-[#2fd8f2] text-[#1a1200] text-sm font-extrabold transition-colors"
            >
              <FiX className="w-4 h-4" />
              <span>{t.resetFilters}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-[14px]">
          {basePosts.map((post) => {
            const tags = postTags?.[post.id] ?? [];
            const postWithTags: Post =
              tags.length > 0
                ? { ...post, post_tags: tags.map((tag) => ({ tags: tag })) }
                : post;
            return <BlogCard key={post.id} post={postWithTags} lang={lang} />;
          })}
        </div>
      )}

      {/* Live count — R4 .blog-count (N from the DB count query) */}
      <p className="blog-count font-mono text-[12.5px] text-[#a9bedd] mt-[13px]">
        {t.showing(basePosts.length, totalCount)}
      </p>

      {/* Pagination controls (?page=) */}
      {showPagination && totalPages > 1 && (
        <nav
          aria-label={lang === "bn" ? "পাতা" : "Pagination"}
          className="flex flex-wrap items-center justify-center gap-2 mt-8"
        >
          {currentPage > 1 ? (
            <Link
              href={buildHref({ page: currentPage - 1 })}
              className="min-h-[46px] px-4 py-2 rounded-full bg-[#0e1729] border-[1.5px] border-[#22345a] text-sm font-extrabold text-[#c3d2ea] hover:border-[#0e7d99] hover:text-[#eef4ff] transition-colors"
            >
              {t.prev}
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="min-h-[46px] px-4 py-2 rounded-full bg-[#0e1729] border-[1.5px] border-[#1a2947] text-sm font-extrabold text-[#a9bedd]/40"
            >
              {t.prev}
            </span>
          )}

          {pageNumbers.map((n) => (
            <Link
              key={n}
              href={buildHref({ page: n })}
              aria-label={t.pageLabel(n)}
              aria-current={n === currentPage ? "page" : undefined}
              className={`min-h-[46px] min-w-[46px] px-3 py-2 rounded-full text-sm font-extrabold text-center border-[1.5px] transition-colors ${
                n === currentPage
                  ? "bg-[#eef4ff] text-[#060a13] border-[#eef4ff]"
                  : "bg-[#0e1729] text-[#c3d2ea] border-[#22345a] hover:border-[#0e7d99]"
              }`}
            >
              {n}
            </Link>
          ))}

          {currentPage < totalPages ? (
            <Link
              href={buildHref({ page: currentPage + 1 })}
              className="min-h-[46px] px-4 py-2 rounded-full bg-[#0e1729] border-[1.5px] border-[#22345a] text-sm font-extrabold text-[#c3d2ea] hover:border-[#0e7d99] hover:text-[#eef4ff] transition-colors"
            >
              {t.next}
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="min-h-[46px] px-4 py-2 rounded-full bg-[#0e1729] border-[1.5px] border-[#1a2947] text-sm font-extrabold text-[#a9bedd]/40"
            >
              {t.next}
            </span>
          )}
        </nav>
      )}

      {/* Reset link when any filter is active */}
      {isFiltering && basePosts.length > 0 && (
        <p className="text-center mt-6">
          <button
            onClick={handleResetAll}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#2fd8f2] hover:text-[#ffb02e] transition-colors"
          >
            <FiX className="w-4 h-4" />
            <span>{t.resetFilters}</span>
          </button>
        </p>
      )}
    </div>
  );
}
