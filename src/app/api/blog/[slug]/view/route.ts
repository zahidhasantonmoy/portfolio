import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const rows = await sql`
      UPDATE posts
      SET views = COALESCE(views, 0) + 1
      WHERE slug = ${params.slug}
      RETURNING views
    `;

    const currentViews = rows && rows[0] ? rows[0].views : 0;
    return NextResponse.json({ views: currentViews });
  } catch (error: any) {
    console.error("Failed to increment views:", error);
    return NextResponse.json({ error: "Failed to increment view count" }, { status: 500 });
  }
}
