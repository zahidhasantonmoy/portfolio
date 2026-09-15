import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

/** GET /api/blog/[slug] — single published post */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const supabase = await createClient();

    const { data: post, error } = await supabase
      .from("posts")
      .select(
        `*, categories(id, name_en, name_bn, slug, color),
         post_tags(tags(id, name_en, name_bn, slug))`
      )
      .eq("slug", slug)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .single();

    if (error || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Related posts (same category)
    const { data: related } = await supabase
      .from("posts")
      .select("id, title_en, title_bn, slug, excerpt_en, cover_image_url, published_at, read_time_min")
      .eq("status", "published")
      .eq("post_type", "blog")
      .eq("category_id", post.category_id ?? "")
      .neq("id", post.id)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(3);

    return NextResponse.json(
      { post, related: related ?? [] },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err) {
    console.error("[GET /api/blog/[slug]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
