import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getJournalEntryByDate } from "@/lib/blog";
import ArticleContent from "@/components/blog/ArticleContent";
import type { LogMood } from "@/types/blog";

export const revalidate = 60; // ISR — 60 seconds

const MOOD_CONFIG: Record<LogMood, { emoji: string; label: string }> = {
  productive: { emoji: "🚀", label: "Productive day" },
  learning: { emoji: "📚", label: "Learning mode" },
  breakthrough: { emoji: "💡", label: "Breakthrough!" },
  stuck: { emoji: "😤", label: "Hit a wall" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  const entry = await getJournalEntryByDate(date);
  if (!entry) return { title: "Journal Entry Not Found" };
  return {
    title: `${entry.title} | Dev Journal — Zahid Hasan Tonmoy`,
    description: `Development journal entry for ${date} — ${entry.mood} day working with ${(entry.tech_stack ?? []).join(", ")}.`,
  };
}

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const entry = await getJournalEntryByDate(date);
  if (!entry) notFound();

  const mood = MOOD_CONFIG[entry.mood] ?? MOOD_CONFIG.learning;
  const displayDate = new Date(entry.log_date).toLocaleDateString("en-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // JSON-LD Article schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: entry.title,
    description: `Development journal entry for ${date} — ${entry.mood} day working with ${(entry.tech_stack ?? []).join(", ")}.`,
    datePublished: entry.log_date,
    dateModified: entry.created_at || entry.log_date,
    author: {
      "@type": "Person",
      name: "Zahid Hasan Tonmoy",
      url: "https://zahidhasantonmoy.vercel.app",
    },
    publisher: {
      "@type": "Person",
      name: "Zahid Hasan Tonmoy",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://zahidhasantonmoy.vercel.app/journal/${date}`,
    },
    inLanguage: "en",
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300">Home</Link>
          <span>/</span>
          <Link href="/journal" className="hover:text-gray-700 dark:hover:text-gray-300">Journal</Link>
          <span>/</span>
          <span className="text-gray-800 dark:text-gray-200">{date}</span>
        </nav>

        {/* Header */}
        <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{mood.emoji}</span>
            <span className="text-sm text-gray-500">{mood.label}</span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="text-sm text-gray-500">{displayDate}</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {entry.title}
          </h1>

          {/* Tech stack */}
          {entry.tech_stack && entry.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {entry.tech_stack.map((tech) => (
                <span
                  key={tech}
                  className="text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content — show Bengali toggle if available */}
        {entry.content_bn && (
          <div className="flex gap-2 mb-6">
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              🇬🇧 English
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
              🇧🇩 বাংলা (below)
            </span>
          </div>
        )}

        <ArticleContent content={entry.content_en ?? ""} />

        {/* Bangla content section */}
        {entry.content_bn && (
          <div className="mt-12 pt-8 border-t border-dashed border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-lg">🇧🇩</span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">বাংলায় পড়ুন</h2>
            </div>
            <ArticleContent content={entry.content_bn} />
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-sm text-indigo-500 hover:text-indigo-400 transition"
          >
            ← All Journal Entries
          </Link>
        </div>
      </article>
    </main>
  );
}
