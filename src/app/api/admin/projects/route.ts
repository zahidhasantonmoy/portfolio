import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM projects ORDER BY display_order ASC, created_at DESC`;
    return NextResponse.json({ projects: rows });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { title, description, tech_stack, github_url, live_url, image_url, display_order } = body;

    if (!title || !description || !tech_stack) {
      return NextResponse.json({ error: "Title, description, and tech_stack are required" }, { status: 400 });
    }

    const insertedRows = await sql`
      INSERT INTO projects (title, description, tech_stack, github_url, live_url, image_url, display_order)
      VALUES (${title}, ${description}, ${tech_stack}, ${github_url || null}, ${live_url || null}, ${image_url || null}, ${display_order || 0})
      RETURNING *
    `;

    revalidatePath("/");
    revalidatePath("/admin/projects");

    return NextResponse.json({ project: insertedRows[0] }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
