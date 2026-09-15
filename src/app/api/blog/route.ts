import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

/** GET /api/blog — published blog posts list */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const category = searchParams.get("category") || undefined;
  const tag = searchParams.get("tag") || undefined;
  const limit = parseInt(searchParams.get("limit") || "12");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    const supabase = await createClient();

    let query = supabase
      .from("posts")
      .select(
        `id, title_en, title_bn, slug, excerpt_en, excerpt_bn,
         cover_image_url, published_at, read_time_min, is_featured, post_type,
         categories(id, name_en, name_bn, slug, color)`,
        { count: "exact" }
      )
      .eq("status", "published")
      .eq("post_type", "blog")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(
        `title_en.ilike.%${search}%,title_bn.ilike.%${search}%,excerpt_en.ilike.%${search}%`
      );
    }
    if (category) {
      query = query.eq("categories.slug", category);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      posts: data ?? [],
      total: count ?? 0,
      limit,
      offset,
    });
  } catch (err) {
    console.error("[GET /api/blog]", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
