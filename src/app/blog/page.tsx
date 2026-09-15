import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts, getCategories } from "@/lib/blog";
import BlogCard from "@/components/blog/BlogCard";
import SearchBar from "@/components/blog/SearchBar";

export const revalidate = 300; // ISR — 5 minutes

export const metadata: Metadata = {
  title: "Blog | Zahid Hasan Tonmoy",
  description:
    "Technical articles, tutorials, and learning notes on Laravel, PHP, PostgreSQL, React, JavaScript and more by Zahid Hasan Tonmoy.",
  openGraph: {
    title: "Blog | Zahid Hasan Tonmoy",
    description: "Technical blog on web development, Laravel, React, and more.",
    url: "https://zahidhasantonmoy.vercel.app/blog",
    type: "website",
  },
  alternates: {
    canonical: "https://zahidhasantonmoy.vercel.app/blog",
    languages: {
      en: "https://zahidhasantonmoy.vercel.app/blog",
      bn: "https://zahidhasantonmoy.vercel.app/bn/blog",
    },
  },
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;

  const [posts, categories] = await Promise.all([
    getPublishedPosts({ category, search, limit: 12 }),
    getCategories(),
  ]);

  const featured = posts.find((p) => p.is_featured);
  const regularPosts = posts.filter((p) => !p.is_featured || posts.indexOf(p) > 0);

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-6">
            <span>✍️</span>
            <span>Development Blog</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Thoughts, Tutorials &amp;{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Dev Notes
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Articles on Laravel, PHP, PostgreSQL, React, JavaScript — and everything I&apos;m learning
            as a developer. Also available in{" "}
            <Link href="/bn/blog" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
              বাংলা
            </Link>
            .
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <SearchBar defaultValue={search} />

          <div className="flex gap-2 flex-wrap">
            <Link
              href="/blog"
              className={`px-3 py-1.5 rounded-full text-sm transition ${
                !category
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog?category=${cat.slug}`}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  category === cat.slug
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {cat.name_en}
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {featured && !search && !category && (
          <div className="mb-10">
            <p className="text-xs text-indigo-400 uppercase font-semibold tracking-wider mb-4">
              ⭐ Featured
            </p>
            <Link
              href={`/blog/${featured.slug}`}
              className="group block bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-700 transition"
            >
              <div className="p-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  {featured.categories && (
                    <span
                      className="text-xs px-3 py-1 rounded-full text-white font-medium"
                      style={{ backgroundColor: featured.categories.color }}
                    >
                      {featured.categories.name_en}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition mb-3">
                  {featured.title_en}
                </h2>
                {featured.excerpt_en && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {featured.excerpt_en}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    {featured.published_at &&
                      new Date(featured.published_at).toLocaleDateString("en-BD", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                  </span>
                  <span>·</span>
                  <span>{featured.read_time_min} min read</span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {search ? `No posts found for "${search}"` : "No posts published yet."}
            </p>
            {search && (
              <Link href="/blog" className="mt-4 inline-block text-indigo-500 hover:text-indigo-400">
                ← Clear search
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <BlogCard key={post.id} post={post} lang="en" />
            ))}
          </div>
        )}

        {/* Journal CTA */}
        <div className="mt-16 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            Looking for daily learning notes? Check my Development Journal.
          </p>
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            📓 View Dev Journal →
          </Link>
        </div>
      </div>
    </main>
  );
}
