import type { Metadata } from "next";
import Link from "next/link";
import { getJournalEntries } from "@/lib/blog";
import type { LogMood } from "@/types/blog";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Dev Journal | Zahid Hasan Tonmoy",
  description:
    "Daily development journal — what I'm learning, building, and exploring every day as a developer.",
};

const MOOD_CONFIG: Record<LogMood, { emoji: string; label: string; color: string }> = {
  productive: { emoji: "🚀", label: "Productive", color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" },
  learning: { emoji: "📚", label: "Learning", color: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400" },
  breakthrough: { emoji: "💡", label: "Breakthrough!", color: "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400" },
  stuck: { emoji: "😤", label: "Stuck", color: "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400" },
};

export default async function JournalPage() {
  const entries = await getJournalEntries(30);

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
            <span>📓</span>
            <span>Development Journal</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Daily Learning{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Journal
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Raw, honest notes from my daily coding journey — what I learned, what broke, and what clicked.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {entries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📓</p>
            <p className="text-gray-500">No journal entries yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => {
              const mood = MOOD_CONFIG[entry.mood] ?? MOOD_CONFIG.learning;
              const date = new Date(entry.log_date).toLocaleDateString("en-BD", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              });

              return (
                <Link
                  key={entry.id}
                  href={`/journal/${entry.log_date}`}
                  className="group block p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Date */}
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{date}</p>

                      {/* Title */}
                      <h2 className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition mb-3 text-lg">
                        {entry.title}
                      </h2>

                      {/* Tech Stack */}
                      {entry.tech_stack && entry.tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {entry.tech_stack.slice(0, 5).map((tech) => (
                            <span
                              key={tech}
                              className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Mood Badge */}
                    <div className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${mood.color}`}>
                      <span>{mood.emoji}</span>
                      <span className="hidden sm:inline">{mood.label}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* CTA to Blog */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm mb-3">
            Want longer articles? Check the main blog.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            📝 Read Blog →
          </Link>
        </div>
      </div>
    </main>
  );
}
