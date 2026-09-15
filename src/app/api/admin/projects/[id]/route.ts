import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const { title, description, tech_stack, github_url, live_url, image_url, display_order } = body;

    const updatedRows = await sql`
      UPDATE projects SET
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        tech_stack = COALESCE(${tech_stack}, tech_stack),
        github_url = COALESCE(${github_url}, github_url),
        live_url = COALESCE(${live_url}, live_url),
        image_url = COALESCE(${image_url}, image_url),
        display_order = COALESCE(${display_order}, display_order),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    revalidatePath("/");
    revalidatePath("/admin/projects");

    return NextResponse.json({ project: updatedRows[0] });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await sql`DELETE FROM projects WHERE id = ${id}`;
    
    revalidatePath("/");
    revalidatePath("/admin/projects");

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
