import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import JournalForm, { toFormInitial } from "../../JournalForm";
import type { DevLog } from "@/types/blog";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Edit journal entry — thin server wrapper: loads the row (404 when absent)
 * and renders the shared JournalForm with its values. The form submits via
 * PATCH /api/admin/journal?id=<id>. No new guard: this page lives under the
 * (dashboard) layout, which redirects unauthenticated users to /admin/login.
 */
export default async function EditJournalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const rows = await sql`
    SELECT id, log_date, title, mood, content_en, content_bn, tech_stack, is_public, created_at
    FROM development_logs
    WHERE id = ${id}::uuid
    LIMIT 1
  `;
  if (!rows.length) notFound();

  const entry = rows[0] as DevLog;
  const dateKey = String(entry.log_date).slice(0, 10);

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <p className="font-mono text-[11px] tracking-[0.12em] text-cyan uppercase">Admin · Journal</p>
        <h1 className="text-2xl font-bold text-ink font-display">Edit Journal Entry</h1>
        <p className="text-ink-mute text-sm mt-1">
          {dateKey} — {entry.title}
        </p>
      </div>

      <JournalForm initial={toFormInitial(entry)} entryId={entry.id} />
    </div>
  );
}
