import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { createClient } from "@/lib/supabase-server";
import type { PostFormData } from "@/types/blog";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** GET /api/admin/posts/[id] — single post (admin) */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("posts")
    .select(`*, categories(*), post_tags(tags(*))`)
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post: data });
}

/** PATCH /api/admin/posts/[id] — update post */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body: Partial<PostFormData> = await request.json();
    const { tag_ids, ...postData } = body;

    const admin = createAdminClient();

    // Recalculate read time if content changed
    if (postData.content_en) {
      const wordCount = postData.content_en.split(/\s+/).length;
      postData.read_time_min = Math.max(1, Math.ceil(wordCount / 200));
    }

    const { data: post, error } = await admin
      .from("posts")
      .update({ ...postData, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Update tags — delete old, insert new
    if (tag_ids !== undefined) {
      await admin.from("post_tags").delete().eq("post_id", id);
      if (tag_ids.length > 0) {
        const tagInserts = tag_ids.map((tag_id) => ({ post_id: id, tag_id }));
        await admin.from("post_tags").insert(tagInserts);
      }
    }

    return NextResponse.json({ post });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** DELETE /api/admin/posts/[id] — delete post */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();

  const { error } = await admin.from("posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
