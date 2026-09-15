import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { createClient } from "@/lib/supabase-server";
import type { PostFormData } from "@/types/blog";

/** GET /api/admin/posts — all posts (admin only) */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("posts")
    .select(`*, categories(id, name_en, slug)`)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data ?? [] });
}

/** POST /api/admin/posts — create new post */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body: PostFormData = await request.json();
    const { tag_ids, ...postData } = body;

    // Slug uniqueness check
    if (!postData.slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Auto-calculate read time if not provided
    const wordCount = (postData.content_en ?? "").split(/\s+/).length;
    postData.read_time_min = Math.max(1, Math.ceil(wordCount / 200));

    // Insert post
    const { data: post, error: postError } = await admin
      .from("posts")
      .insert({ ...postData, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (postError) throw postError;

    // Insert tags
    if (tag_ids && tag_ids.length > 0) {
      const tagInserts = tag_ids.map((tag_id) => ({ post_id: post.id, tag_id }));
      await admin.from("post_tags").insert(tagInserts);
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
