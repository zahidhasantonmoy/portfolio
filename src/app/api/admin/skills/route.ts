import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM skills ORDER BY display_order ASC, created_at DESC`;
    return NextResponse.json({ skills: rows });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { category, name, icon, proficiency, display_order } = body;

    if (!category || !name) {
      return NextResponse.json({ error: "Category and name are required" }, { status: 400 });
    }

    const insertedRows = await sql`
      INSERT INTO skills (category, name, icon, proficiency, display_order)
      VALUES (${category}, ${name}, ${icon || null}, ${proficiency || null}, ${display_order || 0})
      RETURNING *
    `;

    revalidatePath("/");
    revalidatePath("/admin/skills");

    return NextResponse.json({ skill: insertedRows[0] }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to create skill" }, { status: 500 });
  }
}
