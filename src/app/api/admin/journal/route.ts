import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { DevLog, LogMood } from "@/types/blog";

const PAGE_SIZE = 20;
const MOODS: LogMood[] = ["productive", "learning", "breakthrough", "stuck"];
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

function revalidateJournal(dateKey?: string | null) {
  revalidatePath("/journal");
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/journal");
  if (dateKey) revalidatePath(`/journal/${dateKey}`, "page");
}

/** GET /api/admin/journal?page= — paginated list, newest first */
export async function GET(request: Request) {
  const unauthorized = await checkAuth();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const currentPage = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);

    const totalRows = await sql`SELECT COUNT(*)::int as count FROM development_logs`;
    const total = Number(totalRows[0]?.count ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const safeOffset = (safePage - 1) * PAGE_SIZE;

    const logs = await sql`
      SELECT id, log_date, title, mood, content_en, content_bn, tech_stack, is_public, created_at
      FROM development_logs
      ORDER BY log_date DESC, created_at DESC
      LIMIT ${PAGE_SIZE} OFFSET ${safeOffset}
    `;

    return NextResponse.json({ logs, total, page: safePage, totalPages, pageSize: PAGE_SIZE });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/journal — create new dev log.
 * Upsert-or-reject: one entry per log_date. If a row already exists for the
 * given date, returns 409 with the existing entry's id instead of inserting
 * a duplicate (the old plain INSERT allowed duplicates).
 */
export async function POST(request: Request) {
  const unauthorized = await checkAuth();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();

    if (!body.log_date || !String(body.title ?? "").trim() || !String(body.content_en ?? "").trim()) {
      return NextResponse.json(
        { error: "log_date, title and content_en are required" },
        { status: 400 }
      );
    }
    if (body.mood !== undefined && body.mood !== null && !MOODS.includes(body.mood)) {
      return NextResponse.json(
        { error: `mood must be one of: ${MOODS.join(", ")}` },
        { status: 400 }
      );
    }

    const existing = await sql`
      SELECT id FROM development_logs WHERE log_date = ${body.log_date}::date LIMIT 1
    `;
    if (existing.length > 0) {
      return NextResponse.json(
        {
          error: `An entry already exists for ${String(body.log_date).slice(0, 10)}. Edit it instead of creating a duplicate.`,
          existingId: existing[0].id,
        },
        { status: 409 }
      );
    }

    const insertedRows = await sql`
      INSERT INTO development_logs (
        log_date, title, mood, content_en, content_bn, tech_stack, is_public, created_at
      ) VALUES (
        ${body.log_date}, ${body.title}, ${body.mood || "productive"}, ${body.content_en},
        ${body.content_bn || null}, ${body.tech_stack || null}, ${body.is_public ?? true}, NOW()
      )
      RETURNING *
    `;

    revalidateJournal(String(body.log_date).slice(0, 10));

    return NextResponse.json({ log: insertedRows[0] }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/journal?id= — update one entry.
 * Only columns that exist on development_logs are accepted; unknown fields
 * are ignored. Changing log_date to a date that already has another entry
 * is rejected with 409.
 */
export async function PATCH(request: Request) {
  const unauthorized = await checkAuth();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") ?? "";
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: "A valid entry id is required" }, { status: 400 });
    }

    const body: Partial<DevLog> = await request.json();

    if (body.mood !== undefined && body.mood !== null && !MOODS.includes(body.mood)) {
      return NextResponse.json(
        { error: `mood must be one of: ${MOODS.join(", ")}` },
        { status: 400 }
      );
    }
    if (body.title !== undefined && !String(body.title).trim()) {
      return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
    }
    if (body.content_en !== undefined && !String(body.content_en).trim()) {
      return NextResponse.json({ error: "content_en cannot be empty" }, { status: 400 });
    }

    const existing = await sql`
      SELECT id, log_date FROM development_logs WHERE id = ${id}::uuid LIMIT 1
    `;
    if (existing.length === 0) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Moving the entry to a date that already has a different entry would
    // create a duplicate day — reject it.
    if (body.log_date) {
      const clash = await sql`
        SELECT id FROM development_logs
        WHERE log_date = ${body.log_date}::date AND id <> ${id}::uuid
        LIMIT 1
      `;
      if (clash.length > 0) {
        return NextResponse.json(
          {
            error: `An entry already exists for ${String(body.log_date).slice(0, 10)}. Pick a different date.`,
            existingId: clash[0].id,
          },
          { status: 409 }
        );
      }
    }

    const updatedRows = await sql`
      UPDATE development_logs SET
        log_date = COALESCE(${body.log_date ? body.log_date : null}::date, log_date),
        title = COALESCE(${body.title ?? null}, title),
        mood = COALESCE(${body.mood ?? null}, mood),
        content_en = COALESCE(${body.content_en ?? null}, content_en),
        content_bn = COALESCE(${body.content_bn ?? null}, content_bn),
        tech_stack = COALESCE(${body.tech_stack ?? null}, tech_stack),
        is_public = COALESCE(${body.is_public ?? null}, is_public)
      WHERE id = ${id}::uuid
      RETURNING *
    `;

    const updated = updatedRows[0];
    const newDateKey = updated ? String(updated.log_date).slice(0, 10) : null;
    const oldDateKey = String(existing[0].log_date).slice(0, 10);
    revalidateJournal(newDateKey);
    if (oldDateKey !== newDateKey) revalidateJournal(oldDateKey);

    return NextResponse.json({ log: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** DELETE /api/admin/journal?id= — delete one entry */
export async function DELETE(request: Request) {
  const unauthorized = await checkAuth();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") ?? "";
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: "A valid entry id is required" }, { status: 400 });
    }

    const existing = await sql`
      SELECT log_date FROM development_logs WHERE id = ${id}::uuid LIMIT 1
    `;
    if (existing.length === 0) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    await sql`DELETE FROM development_logs WHERE id = ${id}::uuid`;

    revalidateJournal(String(existing[0].log_date).slice(0, 10));

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
