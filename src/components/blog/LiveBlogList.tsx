"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiX, FiFilter } from "react-icons/fi";
import type { Post, Category } from "@/types/blog";
import BlogCard from "@/components/blog/BlogCard";

interface LiveBlogListProps {
  initialPosts: Post[];
  categories: Category[];
  lang?: "en" | "bn";
  initialCategory?: string;
  initialSearch?: string;
}

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

  // Calculate category counts
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

  // Filtered posts based on category and search query
  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return basePosts.filter((post) => {
      // Category match
      if (selectedCategory && post.categories?.slug !== selectedCategory) {
        return false;
      }
      // Search query match
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
  const featured = !isFiltering ? filteredPosts.find((p) => p.is_featured) : null;
  const regularPosts = featured
    ? filteredPosts.filter((p) => p.id !== featured.id)
    : filteredPosts;

  const t = {
    searchPlaceholder:
      lang === "bn"
        ? "আর্টিকেল বা টপিক খুঁজুন..."
        : "Search articles by title, topic, or keyword...",
    all: lang === "bn" ? "সব আর্টিকেল" : "All Articles",
    showing: (count: number, total: number) =>
      lang === "bn"
        ? `${total} টির মধ্যে ${count} টি আর্টিকেল দেখানো হচ্ছে`
        : `Showing ${count} of ${total} articles`,
    noResults:
      lang === "bn"
        ? "আপনার অনুসন্ধানের সাথে কোনো আর্টিকেল মেলেনি"
        : "No articles found matching your criteria",
    tryAdjusting:
      lang === "bn"
        ? "বানান পরীক্ষা করুন বা অন্য কোনো কীওয়ার্ড দিয়ে চেষ্টা করুন।"
        : "Try adjusting your search terms or clearing the category filter.",
    resetFilters: lang === "bn" ? "ফিল্টার রিসেট করুন" : "Reset all filters",
    featuredBadge: lang === "bn" ? "⭐ বিশেষ ফিচার্ড পোস্ট" : "⭐ Featured Post",
    minRead: lang === "bn" ? "মিনিটের পড়া" : "min read",
  };

  return (
    <div className="space-y-8">
      {/* Search Bar & Stats Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Real-time Search Input */}
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
            <FiSearch className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-gray-200 dark:border-gray-700/80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-all"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title="Clear search"
            >
              <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600">
                <FiX className="w-3.5 h-3.5" />
              </div>
            </button>
          )}
        </div>

        {/* Live Count Pill */}
        <div className="flex items-center gap-2 self-end md:self-auto text-xs font-medium px-3.5 py-2 rounded-xl bg-gray-100/80 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/50 whitespace-nowrap">
          <FiFilter className="w-3.5 h-3.5 text-indigo-500" />
          <span>{t.showing(filteredPosts.length, basePosts.length)}</span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
        {/* All Pill */}
        <button
          onClick={() => handleCategoryClick("")}
          className={`relative px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-2 border ${
            !selectedCategory
              ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-[1.02]"
              : "bg-white dark:bg-gray-800/90 border-gray-200 dark:border-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60"
          }`}
        >
          <span>{t.all}</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              !selectedCategory
                ? "bg-white/20 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            }`}
          >
            {basePosts.length}
          </span>
        </button>

        {/* Individual Category Pills */}
        {categories.map((cat) => {
          const count = categoryCounts[cat.slug] ?? 0;
          const isSelected = selectedCategory === cat.slug;
          const catName =
            lang === "bn" && cat.name_bn ? cat.name_bn : cat.name_en;

          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`relative px-3.5 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 flex items-center gap-2 border ${
                isSelected
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-[1.02]"
                  : "bg-white dark:bg-gray-800/90 border-gray-200 dark:border-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60"
              }`}
            >
              {/* Category Color Dot */}
              <span
                className="w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-gray-800"
                style={{ backgroundColor: cat.color }}
              />
              <span>{catName}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Featured Post (Visible only on default view without active search/filter) */}
      {featured && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
              {t.featuredBadge}
            </span>
          </div>
          <Link
            href={lang === "bn" ? `/bn/blog/${featured.slug}` : `/blog/${featured.slug}`}
            className="group block bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/40 dark:via-gray-800/60 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-3xl overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 hover:shadow-xl dark:hover:shadow-indigo-950/30"
          >
            <div className="p-7 md:p-9 flex flex-col md:flex-row gap-6 items-center">
              {featured.cover_image_url && (
                <div className="w-full md:w-5/12 h-52 md:h-64 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featured.cover_image_url}
                    alt={featured.title_en}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="flex-1 space-y-4">
                {featured.categories && (
                  <span
                    className="inline-block text-xs px-3 py-1 rounded-full text-white font-semibold shadow-sm"
                    style={{ backgroundColor: featured.categories.color }}
                  >
                    {lang === "bn" && featured.categories.name_bn
                      ? featured.categories.name_bn
                      : featured.categories.name_en}
                  </span>
                )}
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                  {lang === "bn" && featured.title_bn
                    ? featured.title_bn
                    : featured.title_en}
                </h2>
                {(featured.excerpt_en || featured.excerpt_bn) && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base line-clamp-3 leading-relaxed">
                    {lang === "bn" && featured.excerpt_bn
                      ? featured.excerpt_bn
                      : featured.excerpt_en}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs font-medium text-gray-400 dark:text-gray-500 pt-2">
                  <span>
                    {featured.published_at &&
                      new Date(featured.published_at).toLocaleDateString(
                        lang === "bn" ? "bn-BD" : "en-BD",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                  </span>
                  <span>•</span>
                  <span>
                    {featured.read_time_min} {t.minRead}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Posts Grid or Empty State */}
      <AnimatePresence mode="wait">
        {filteredPosts.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20 px-4 bg-gray-50/50 dark:bg-gray-800/30 border border-dashed border-gray-200 dark:border-gray-700/60 rounded-3xl"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-3xl">
              🔍
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t.noResults}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto mb-6">
              {searchQuery ? `"${searchQuery}" — ` : ""}
              {t.tryAdjusting}
            </p>
            <button
              onClick={handleResetAll}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <FiX className="w-4 h-4" />
              <span>{t.resetFilters}</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {regularPosts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <BlogCard post={post} lang={lang} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
