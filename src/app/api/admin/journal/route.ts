import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { DevLog } from "@/types/blog";

/** POST /api/admin/journal — create new dev log */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();

    const insertedRows = await sql`
      INSERT INTO development_logs (
        log_date, title, mood, content_en, content_bn, tech_stack, is_public, created_at
      ) VALUES (
        ${body.log_date}, ${body.title}, ${body.mood}, ${body.content_en},
        ${body.content_bn || null}, ${body.tech_stack || null}, ${body.is_public}, NOW()
      )
      RETURNING *
    `;

    revalidatePath("/journal");
    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ log: insertedRows[0] }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
