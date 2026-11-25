import { sql } from "@/lib/db";
import PostEditor from "../PostEditor";

// Strict allowlist for the calendar deep link (?scheduleDate=): YYYY-MM-DD,
// optionally with a THH:mm suffix exactly as CalendarClient sends
// (YYYY-MM-DDT10:00). Anything else — including non-dates, impossible dates
// and raw query strings — is dropped and the editor opens with no prefill.
function parseScheduleDateParam(raw: string | undefined): string | undefined {
  if (!raw || typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(trimmed);
  if (!m) return undefined;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const h = m[4] ? Number(m[4]) : 10;
  const min = m[5] ? Number(m[5]) : 0;
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || min > 59) return undefined;
  const dt = new Date(y, mo - 1, d, h, min, 0);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return undefined;
  return trimmed;
}

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ scheduleDate?: string }>;
}) {
  const params = await searchParams;
  const initialScheduleDate = parseScheduleDateParam(params?.scheduleDate);

  const [categories, tags] = await Promise.all([
    sql`SELECT id, name_en, slug FROM categories ORDER BY name_en`,
    sql`SELECT id, name_en, slug FROM tags ORDER BY name_en`,
  ]);

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <p className="font-mono text-[11px] tracking-[0.12em] text-cyan uppercase">Admin · Blog</p>
        <h1 className="text-2xl font-bold text-ink font-display">New Post</h1>
        <p className="text-ink-mute text-sm mt-1">Create a new blog post or journal entry</p>
      </div>
      <PostEditor
        categories={categories as any[]}
        tags={tags as any[]}
        mode="create"
        initialScheduleDate={initialScheduleDate}
      />
    </div>
  );
}
