import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { PostFormData } from "@/types/blog";

async function checkAuth() {
  const session = await getServerSession(authOptions);
  return session;
}

/** GET /api/admin/posts/[id] — single post (admin) */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  
  try {
    const rows = await sql`SELECT * FROM posts WHERE id = ${id}`;
    if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    const post = rows[0];
    
    const tagsRows = await sql`
      SELECT tag_id FROM post_tags WHERE post_id = ${id}
    `;
    
    return NextResponse.json({ 
      post: { 
        ...post,
        post_tags: tagsRows
      } 
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Error fetching post" }, { status: 500 });
  }
}

/** PATCH /api/admin/posts/[id] — update post */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body: Partial<PostFormData> = await request.json();
    const { tag_ids, ...postData } = body;

    // Recalculate read time if content changed
    if (postData.content_en) {
      const wordCount = postData.content_en.split(/\s+/).length;
      postData.read_time_min = Math.max(1, Math.ceil(wordCount / 200));
    }

    const updatedRows = await sql`
      UPDATE posts SET
        post_type = COALESCE(${postData.post_type}, post_type),
        status = COALESCE(${postData.status}, status),
        title_en = COALESCE(${postData.title_en}, title_en),
        title_bn = COALESCE(${postData.title_bn}, title_bn),
        slug = COALESCE(${postData.slug}, slug),
        excerpt_en = COALESCE(${postData.excerpt_en}, excerpt_en),
        excerpt_bn = COALESCE(${postData.excerpt_bn}, excerpt_bn),
        content_en = COALESCE(${postData.content_en}, content_en),
        content_bn = COALESCE(${postData.content_bn}, content_bn),
        seo_title_en = COALESCE(${postData.seo_title_en}, seo_title_en),
        seo_title_bn = COALESCE(${postData.seo_title_bn}, seo_title_bn),
        meta_desc_en = COALESCE(${postData.meta_desc_en}, meta_desc_en),
        meta_desc_bn = COALESCE(${postData.meta_desc_bn}, meta_desc_bn),
        cover_image_url = COALESCE(${postData.cover_image_url}, cover_image_url),
        category_id = COALESCE(${postData.category_id}, category_id),
        published_at = COALESCE(${postData.published_at}, published_at),
        read_time_min = COALESCE(${postData.read_time_min}, read_time_min),
        is_featured = COALESCE(${postData.is_featured}, is_featured),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    const post = updatedRows[0];

    // Update tags — delete old, insert new
    if (tag_ids !== undefined) {
      await sql`DELETE FROM post_tags WHERE post_id = ${id}`;
      if (tag_ids.length > 0) {
        for (const tag_id of tag_ids) {
          await sql`INSERT INTO post_tags (post_id, tag_id) VALUES (${id}, ${tag_id})`;
        }
      }
    }

    revalidatePath("/blog");
    revalidatePath("/blog/[slug]", "page");
    revalidatePath("/");

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
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  
  try {
    await sql`DELETE FROM posts WHERE id = ${id}`;
    
    revalidatePath("/blog");
    revalidatePath("/");
    
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
