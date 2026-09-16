import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts, getCategories } from "@/lib/blog";
import LiveBlogList from "@/components/blog/LiveBlogList";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "ব্লগ | জাহিদ হাসান তন্ময়",
  description:
    "Laravel, PHP, PostgreSQL, React, JavaScript সহ আরো অনেক বিষয়ে বাংলায় technical article ও tutorial।",
  alternates: {
    canonical: "https://zahidhasantonmoy.vercel.app/bn/blog",
    languages: {
      bn: "https://zahidhasantonmoy.vercel.app/bn/blog",
      en: "https://zahidhasantonmoy.vercel.app/blog",
    },
  },
};

export default async function BnBlogPage() {
  const [posts, categories] = await Promise.all([
    getPublishedPosts({ limit: 100 }),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-6">
            <span>🇧🇩</span>
            <span>বাংলা ব্লগ</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            প্রযুক্তি শেখার{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              জার্নাল
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-6">
            Laravel, PHP, PostgreSQL, React, JavaScript — আমি যা শিখছি তা বাংলায় লিখছি।
          </p>
          <Link
            href="/blog"
            className="text-sm text-gray-500 hover:text-gray-300 transition"
          >
            🇬🇧 Read in English →
          </Link>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <LiveBlogList
          initialPosts={posts}
          categories={categories}
          lang="bn"
        />
      </div>
    </main>
  );
}
