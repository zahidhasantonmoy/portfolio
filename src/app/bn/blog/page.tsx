import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts, getCategories } from "@/lib/blog";
import BlogCard from "@/components/blog/BlogCard";

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
    getPublishedPosts({ limit: 12 }),
    getCategories(),
  ]);

  // Filter posts that have Bangla content
  const bnPosts = posts.filter((p) => p.title_bn || p.content_bn);

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
        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-10">
          {categories.map((cat) => (
            <span
              key={cat.id}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: cat.color }}
            >
              {cat.name_bn || cat.name_en}
            </span>
          ))}
        </div>

        {bnPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📝</p>
            <p className="text-gray-500 text-lg mb-2">এখনো বাংলায় কোনো article নেই।</p>
            <p className="text-gray-600 text-sm mb-6">
              Admin panel থেকে post লেখার সময় বাংলা content যোগ করুন।
            </p>
            <Link href="/blog" className="text-indigo-500 hover:text-indigo-400 text-sm">
              🇬🇧 English blog পড়ুন →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bnPosts.map((post) => (
              <BlogCard key={post.id} post={post} lang="bn" />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
