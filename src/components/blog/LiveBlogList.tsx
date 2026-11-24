"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import Link from "next/link";
import { FiX } from "react-icons/fi";
import type { Post, Category } from "@/types/blog";

interface LiveBlogListProps {
  initialPosts: Post[];
  categories: Category[];
  lang?: "en" | "bn";
  initialCategory?: string;
  initialSearch?: string;
}

/**
 * Redesign 4 blog list — post rows (category mono tag, title, date · read time),
 * "In simple words:" excerpt line on the first 6 posts when unfiltered,
 * category chips built from real DB categories (0-post categories hidden),
 * and a live "SHOWING X OF N POSTS" count. All data comes from the DB via
 * `initialPosts` / `categories` — nothing is hardcoded.
 */
export default function LiveBlogList({
  initialPosts,
  categories,
  lang = "en",
  initialCategory = "",
  initialSearch = "",
}: LiveBlogListProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [, startTransition] = useTransition();

  // Read URL params on initial client mount if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category");
      const q = params.get("search");
      if (cat) setSelectedCategory(cat);
      if (q) setSearchQuery(q);
    }
  }, []);

  // Sync URL search params silently without reloading page
  const updateUrl = (cat: string, q: string) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    if (q.trim()) params.set("search", q.trim());
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  };

  const handleCategoryClick = (catSlug: string) => {
    const nextCat = selectedCategory === catSlug ? "" : catSlug;
    startTransition(() => {
      setSelectedCategory(nextCat);
      updateUrl(nextCat, searchQuery);
    });
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    updateUrl(selectedCategory, val);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    updateUrl(selectedCategory, "");
  };

  const handleResetAll = () => {
    setSearchQuery("");
    setSelectedCategory("");
    updateUrl("", "");
  };

  // Base pool of posts for this language
  const basePosts = useMemo(() => {
    if (lang === "bn") {
      return initialPosts.filter((p) => p.title_bn || p.content_bn);
    }
    return initialPosts;
  }, [initialPosts, lang]);

  // Calculate category counts (live, from the DB posts in this language)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of categories) {
      counts[cat.slug] = 0;
    }
    for (const post of basePosts) {
      if (post.categories?.slug && counts[post.categories.slug] !== undefined) {
        counts[post.categories.slug]++;
      }
    }
    return counts;
  }, [categories, basePosts]);

  // Only categories that actually have posts in this language
  const visibleCategories = useMemo(
    () => categories.filter((cat) => (categoryCounts[cat.slug] ?? 0) > 0),
    [categories, categoryCounts]
  );

  // Filtered posts based on category and search query
  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return basePosts.filter((post) => {
      // Category match
      if (selectedCategory && post.categories?.slug !== selectedCategory) {
        return false;
      }
      // Search query match (title + category + excerpt, both languages)
      if (q) {
        const titleEn = (post.title_en || "").toLowerCase();
        const titleBn = (post.title_bn || "").toLowerCase();
        const excerptEn = (post.excerpt_en || "").toLowerCase();
        const excerptBn = (post.excerpt_bn || "").toLowerCase();
        const catNameEn = (post.categories?.name_en || "").toLowerCase();
        const catNameBn = (post.categories?.name_bn || "").toLowerCase();

        const match =
          titleEn.includes(q) ||
          titleBn.includes(q) ||
          excerptEn.includes(q) ||
          excerptBn.includes(q) ||
          catNameEn.includes(q) ||
          catNameBn.includes(q);

        if (!match) return false;
      }
      return true;
    });
  }, [basePosts, selectedCategory, searchQuery]);

  const isFiltering = Boolean(selectedCategory || searchQuery.trim());
  // "In simple words:" excerpt line shows only on the first 6 posts,
  // only when nothing is filtered (same rule as the R4 design).
  const showExcerptLine = !isFiltering;

  const t = {
    searchPlaceholder:
      lang === "bn"
        ? `${basePosts.length}টি পোস্ট খুঁজুন…`
        : `Search ${basePosts.length} posts…`,
    all: lang === "bn" ? "সব টপিক" : "All topics",
    showing: (count: number, total: number) =>
      lang === "bn"
        ? `মোট ${total}টির মধ্যে ${count}টি দেখানো হচ্ছে`
        : `SHOWING ${count} OF ${total} POSTS`,
    noResults:
      lang === "bn"
        ? "আপনার অনুসন্ধানের সাথে কোনো আর্টিকেল মেলেনি"
        : "No post matches that. Try a shorter word.",
    tryAdjusting:
      lang === "bn"
        ? "বানান পরীক্ষা করুন বা অন্য কোনো কীওয়ার্ড দিয়ে চেষ্টা করুন।"
        : "Try adjusting your search terms or clearing the category filter.",
    resetFilters: lang === "bn" ? "ফিল্টার রিসেট করুন" : "Reset all filters",
    minRead: lang === "bn" ? "মিনিটের পড়া" : "min read",
    inSimpleWords: lang === "bn" ? "সহজ ভাষায়:" : "In simple words:",
  };

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div>
      {/* Search + category chips — R4 .blog-tools */}
      <div className="blog-tools flex flex-wrap gap-[9px] items-center mt-[22px] mb-1">
        <div className="relative flex-[1_1_240px]">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
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
          aria-pressed={!selectedCategory}
          className={`min-h-[46px] px-[17px] py-[9px] font-extrabold text-[14.5px] cursor-pointer rounded-full border-[1.5px] transition-colors ${
            !selectedCategory
              ? "bg-[#eef4ff] text-[#060a13] border-[#eef4ff]"
              : "bg-[#0e1729] text-[#c3d2ea] border-[#22345a] hover:border-[#0e7d99]"
          }`}
        >
          {t.all}
        </button>

        {/* Category chips — built from real DB categories, 0-post hidden */}
        {visibleCategories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
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

      {/* Post rows — R4 .post-list */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 px-4 mt-[14px] bg-[#0e1729] border-[1.5px] border-dashed border-[#22345a] rounded-[16px]">
          <h3 className="text-lg font-bold text-[#eef4ff] mb-2">{t.noResults}</h3>
          <p className="text-[#a9bedd] text-sm max-w-md mx-auto mb-6">
            {searchQuery ? `“${searchQuery}” — ` : ""}
            {t.tryAdjusting}
          </p>
          <button
            onClick={handleResetAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ffb02e] hover:bg-[#2fd8f2] text-[#1a1200] text-sm font-extrabold transition-colors"
          >
            <FiX className="w-4 h-4" />
            <span>{t.resetFilters}</span>
          </button>
        </div>
      ) : (
        <ul className="post-list list-none mt-[14px] grid gap-[10px]">
          {filteredPosts.map((post, index) => {
            const title =
              lang === "bn" && post.title_bn ? post.title_bn : post.title_en;
            const excerpt =
              lang === "bn" && post.excerpt_bn
                ? post.excerpt_bn
                : post.excerpt_en;
            const catName = post.categories
              ? lang === "bn" && post.categories.name_bn
                ? post.categories.name_bn
                : post.categories.name_en
              : null;
            const href =
              lang === "bn" ? `/bn/blog/${post.slug}` : `/blog/${post.slug}`;
            const showFeat =
              showExcerptLine && index < 6 && Boolean(excerpt);

            return (
              <li key={post.id}>
                <Link
                  href={href}
                  className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 items-baseline bg-[#0e1729] border-[1.5px] border-[#1a2947] rounded-2xl px-[18px] py-[15px] min-h-[48px] hover:border-[#0e7d99] transition-colors"
                >
                  <span className="min-w-0">
                    {catName && (
                      <span className="block font-mono text-[11px] text-[#2fd8f2] tracking-[0.07em] uppercase mb-[2px]">
                        {catName}
                      </span>
                    )}
                    <span className="block font-bold text-[16.5px] leading-[1.35] text-[#eef4ff]">
                      {title}
                    </span>
                  </span>
                  <span className="font-mono text-xs text-[#a9bedd] whitespace-nowrap text-right">
                    {formatDate(post.published_at)} · {post.read_time_min}{" "}
                    {t.minRead}
                  </span>
                  {showFeat && (
                    <span className="col-span-full text-[14.5px] text-[#c3d2ea]">
                      {t.inSimpleWords} {excerpt}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {/* Live count — R4 .blog-count */}
      <p className="blog-count font-mono text-[12.5px] text-[#a9bedd] mt-[13px]">
        {t.showing(filteredPosts.length, basePosts.length)}
      </p>
    </div>
  );
}
