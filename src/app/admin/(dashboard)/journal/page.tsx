import { sql } from "@/lib/db";
import Link from "next/link";
import DeleteJournalButton from "./DeleteJournalButton";
import type { LogMood } from "@/types/blog";

const PAGE_SIZE = 20;

// Same labels as the public journal (src/app/journal/[date]/page.tsx).
const MOOD_CONFIG: Record<LogMood, { emoji: string; label: string }> = {
  productive: { emoji: "🚀", label: "Productive" },
  learning: { emoji: "📚", label: "Learning" },
  breakthrough: { emoji: "💡", label: "Breakthrough" },
  stuck: { emoji: "😤", label: "Stuck" },
};

type SearchParams = {
  page?: string;
};

function buildHref(page: number | null) {
  return page && page > 1 ? `/admin/journal?page=${page}` : "/admin/journal";
}

/** Format a log_date ("YYYY-MM-DD", as returned by Neon) for display. */
function formatDate(value: unknown) {
  const dateKey = String(value).slice(0, 10);
  return new Date(`${dateKey}T00:00:00Z`).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminJournalPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);

  const totalRows = await sql`SELECT COUNT(*)::int as count FROM development_logs`;
  const total = Number(totalRows[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const safeOffset = (safePage - 1) * PAGE_SIZE;

  const entries = await sql`
    SELECT id, log_date, title, mood, is_public, created_at
    FROM development_logs
    ORDER BY log_date DESC, created_at DESC
    LIMIT ${PAGE_SIZE} OFFSET ${safeOffset}
  `;

  const showingFrom = total === 0 ? 0 : safeOffset + 1;
  const showingTo = Math.min(total, safeOffset + (entries?.length ?? 0));

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="font-mono text-[11px] tracking-[0.12em] text-cyan uppercase">Admin · Journal</p>
          <h1 className="text-2xl font-bold text-ink font-display">Dev Journal</h1>
          <p className="text-ink-mute text-sm mt-1">
            {total === 0
              ? "No journal entries yet"
              : `Showing ${showingFrom}–${showingTo} of ${total} ${total === 1 ? "entry" : "entries"}`}
          </p>
        </div>
        <Link
          href="/admin/journal/new"
          className="self-start sm:self-auto px-4 py-2 bg-cyan text-[#060a13] text-sm font-bold rounded-lg transition hover:bg-amber active:scale-95"
        >
          + New Entry
        </Link>
      </div>

      {/* Entries table */}
      <div className="bg-card border border-line-soft rounded-xl overflow-hidden">
        {(entries ?? []).length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">📓</p>
            <p className="text-ink-mute">No journal entries yet</p>
            <Link href="/admin/journal/new" className="mt-3 inline-block text-sm text-cyan hover:text-amber">
              Write your first entry →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-line-soft">
                  <th className="text-left px-6 py-3 text-xs text-ink-mute font-medium uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs text-ink-mute font-medium uppercase">Title</th>
                  <th className="text-left px-4 py-3 text-xs text-ink-mute font-medium uppercase">Mood</th>
                  <th className="text-left px-4 py-3 text-xs text-ink-mute font-medium uppercase">Visibility</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {(entries ?? []).map((entry: any) => {
                  const mood = MOOD_CONFIG[entry.mood as LogMood] ?? MOOD_CONFIG.learning;
                  const dateKey = String(entry.log_date).slice(0, 10);
                  return (
                    <tr key={entry.id} className="hover:bg-card2/60 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-ink font-medium">{formatDate(entry.log_date)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-ink font-medium">{entry.title}</p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
                          <span>{mood.emoji}</span>
                          {mood.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {entry.is_public ? (
                          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            Public
                          </span>
                        ) : (
                          <span className="text-xs text-ink-mute bg-card2 border border-line px-2 py-0.5 rounded-full">
                            Private
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/journal/${dateKey}`}
                            target="_blank"
                            className="text-xs text-ink-mute hover:text-ink"
                          >
                            View ↗
                          </Link>
                          <Link
                            href={`/admin/journal/${entry.id}/edit`}
                            className="text-xs text-cyan hover:text-amber"
                          >
                            Edit
                          </Link>
                          <DeleteJournalButton entryId={entry.id} entryTitle={entry.title} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-between mt-5" aria-label="Journal pagination">
          {safePage > 1 ? (
            <Link
              href={buildHref(safePage - 1)}
              className="px-3.5 py-2 bg-card border border-line-soft rounded-lg text-sm text-ink-soft transition hover:border-cyan hover:text-cyan"
            >
              ← Prev
            </Link>
          ) : (
            <span className="px-3.5 py-2 text-sm text-ink-mute opacity-50">← Prev</span>
          )}
          <span className="text-xs text-ink-mute font-mono">
            Page {safePage} of {totalPages}
          </span>
          {safePage < totalPages ? (
            <Link
              href={buildHref(safePage + 1)}
              className="px-3.5 py-2 bg-card border border-line-soft rounded-lg text-sm text-ink-soft transition hover:border-cyan hover:text-cyan"
            >
              Next →
            </Link>
          ) : (
            <span className="px-3.5 py-2 text-sm text-ink-mute opacity-50">Next →</span>
          )}
        </nav>
      )}
    </div>
  );
}
