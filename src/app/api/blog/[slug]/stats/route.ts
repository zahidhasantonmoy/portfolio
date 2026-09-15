import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Ensure columns exist safely
let columnsEnsured = false;
async function ensureStatsColumns() {
  if (columnsEnsured) return;
  try {
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0`;
    columnsEnsured = true;
  } catch (e) {
    // If user lacks DDL permission or column already exists
    console.warn("Could not alter table posts:", e);
  }
}

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await ensureStatsColumns();
    const rows = await sql`
      SELECT views, likes FROM posts WHERE slug = ${params.slug} LIMIT 1
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ views: 0, likes: 0 });
    }

    return NextResponse.json({
      views: rows[0].views || 0,
      likes: rows[0].likes || 0,
    });
  } catch (error: any) {
    console.error("Failed to fetch blog stats:", error);
    return NextResponse.json({ views: 0, likes: 0 }, { status: 500 });
  }
}
