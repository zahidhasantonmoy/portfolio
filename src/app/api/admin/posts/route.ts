import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { PostFormData } from "@/types/blog";

/** GET /api/admin/posts — all posts (admin only) */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rows = await sql`
      SELECT p.*,
             c.id as cat_id, c.name_en as cat_name_en, c.slug as cat_slug
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `;

    const posts = rows.map((r) => ({
      ...r,
      categories: r.cat_id
        ? { id: r.cat_id, name_en: r.cat_name_en, slug: r.cat_slug }
        : null,
    }));

    return NextResponse.json({ posts });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error fetching posts" }, { status: 500 });
  }
}

/** POST /api/admin/posts — create new post */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body: PostFormData = await request.json();
    const { tag_ids, ...postData } = body;

    if (!postData.slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // Auto-calculate read time if not provided
    const wordCount = (postData.content_en ?? "").split(/\s+/).length;
    postData.read_time_min = Math.max(1, Math.ceil(wordCount / 200));

    // Insert post
    const insertedRows = await sql`
      INSERT INTO posts (
        post_type, status, title_en, title_bn, slug, excerpt_en, excerpt_bn,
        content_en, content_bn, seo_title_en, seo_title_bn, meta_desc_en, meta_desc_bn,
        cover_image_url, category_id, published_at, read_time_min, is_featured, updated_at
      ) VALUES (
        ${postData.post_type}, ${postData.status}, ${postData.title_en}, ${postData.title_bn || null},
        ${postData.slug}, ${postData.excerpt_en || null}, ${postData.excerpt_bn || null},
        ${postData.content_en || null}, ${postData.content_bn || null},
        ${postData.seo_title_en || null}, ${postData.seo_title_bn || null},
        ${postData.meta_desc_en || null}, ${postData.meta_desc_bn || null},
        ${postData.cover_image_url || null}, ${postData.category_id || null},
        ${postData.published_at || null}, ${postData.read_time_min}, ${postData.is_featured || false},
        NOW()
      )
      RETURNING *
    `;

    const post = insertedRows[0];

    // Insert tags
    if (tag_ids && tag_ids.length > 0) {
      for (const tag_id of tag_ids) {
        await sql`INSERT INTO post_tags (post_id, tag_id) VALUES (${post.id}, ${tag_id})`;
      }
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
