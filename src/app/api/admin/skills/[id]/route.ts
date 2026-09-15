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
    const { category, name, icon, proficiency, display_order } = body;

    const updatedRows = await sql`
      UPDATE skills SET
        category = COALESCE(${category}, category),
        name = COALESCE(${name}, name),
        icon = COALESCE(${icon}, icon),
        proficiency = COALESCE(${proficiency}, proficiency),
        display_order = COALESCE(${display_order}, display_order)
      WHERE id = ${id}
      RETURNING *
    `;

    revalidatePath("/");
    revalidatePath("/admin/skills");

    return NextResponse.json({ skill: updatedRows[0] });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to update skill" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await sql`DELETE FROM skills WHERE id = ${id}`;
    
    revalidatePath("/");
    revalidatePath("/admin/skills");

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to delete skill" }, { status: 500 });
  }
}
