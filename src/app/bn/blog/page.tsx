import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts, getCategories } from "@/lib/blog";
import LiveBlogList from "@/components/blog/LiveBlogList";

export const revalidate = 60; // ISR — 60 seconds

export const metadata: Metadata = {
  title: "বাংলা টেক ব্লগ | জাহিদ হাসান তন্ময় - MERN ও AI ইঞ্জিনিয়ারিং",
  description:
    "MERN স্ট্যাক, Next.js, React, TypeScript, পাইথন মেশিন লার্নিং ও এআই এজেন্ট ডেভেলপমেন্ট সহ আধুনিক ওয়েব প্রযুক্তির উপর বাংলায় গভীর টেকনিক্যাল আর্টিকেল ও টিউটোরিয়াল।",
  keywords: [
    "বাংলা ব্লগ",
    "প্রোগ্রামিং টিউটোরিয়াল বাংলা",
    "MERN Stack Bangla",
    "Next.js Bangla Tutorial",
    "React বাংলা",
    "মেশিন লার্নিং বাংলা",
    "জাহিদ হাসান তন্ময়",
    "ওয়েব ডেভেলপমেন্ট বাংলাদেশ"
  ],
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
            <span>বাংলা ইঞ্জিনিয়ারিং ব্লগ</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            প্রযুক্তি ও ইঞ্জিনিয়ারিং{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              নোটস
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-6">
            MERN স্ট্যাক, Next.js, AI এজেন্টস, পাইথন মেশিন লার্নিং ও স্কেলেবল ওয়েব আর্কিটেকচার — বাস্তব প্রজেক্টের অভিজ্ঞতা বাংলায়।
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
