import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts, getCategories } from "@/lib/blog";
import LiveBlogList from "@/components/blog/LiveBlogList";

export const revalidate = 60; // ISR — 60 seconds for fast scheduled post publication

export const metadata: Metadata = {
  title: "Blog | Zahid Hasan Tonmoy - MERN, AI & Web Engineering",
  description:
    "Technical articles, in-depth tutorials, and architectural notes on MERN Stack, Next.js, TypeScript, AI Agents, Python Machine Learning, and Cloud Development by Zahid Hasan Tonmoy.",
  keywords: [
    "MERN Stack Tutorial",
    "Next.js 14",
    "React",
    "Node.js",
    "TypeScript",
    "AI Agent Development",
    "Python Machine Learning",
    "Zahid Hasan Tonmoy",
    "Software Engineering Blog",
    "Web Development Bangladesh"
  ],
  openGraph: {
    title: "Blog | Zahid Hasan Tonmoy - MERN, AI & Web Engineering",
    description: "Technical blog on MERN Stack, Next.js, AI Agents, Machine Learning, and Modern Web Architecture.",
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
    getPublishedPosts({ limit: 100 }),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Zahid Hasan Tonmoy's Technical Blog",
            description: "Technical articles on MERN Stack, Next.js, TypeScript, AI Agents, and Machine Learning.",
            url: "https://zahidhasantonmoy.vercel.app/blog",
            isPartOf: {
              "@type": "WebSite",
              name: "Zahid Hasan Tonmoy's Portfolio",
              url: "https://zahidhasantonmoy.vercel.app"
            }
          })
        }}
      />
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-6">
            <span>✍️</span>
            <span>Engineering & AI Blog</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Thoughts, Tutorials &amp;{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Dev Notes
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Practical insights on MERN Stack, Next.js, AI Agents, Python ML, and scalable web architecture — everything I&apos;m building and learning as an engineer. Also available in{" "}
            <Link href="/bn/blog" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
              বাংলা
            </Link>
            .
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Real-time Search, Category Pills & Filtered Posts Grid */}
        <LiveBlogList
          initialPosts={posts}
          categories={categories}
          lang="en"
          initialCategory={category}
          initialSearch={search}
        />

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
