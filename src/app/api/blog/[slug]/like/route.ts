import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await req.json().catch(() => ({ count: 1 }));
    const count = Math.min(Math.max(Number(body.count) || 1, 1), 10); // cap single increment to 10

    const rows = await sql`
      UPDATE posts
      SET likes = COALESCE(likes, 0) + ${count}
      WHERE slug = ${params.slug}
      RETURNING likes
    `;

    const currentLikes = rows && rows[0] ? rows[0].likes : 0;
    return NextResponse.json({ likes: currentLikes });
  } catch (error: any) {
    console.error("Failed to increment likes:", error);
    return NextResponse.json({ error: "Failed to increment like count" }, { status: 500 });
  }
}
