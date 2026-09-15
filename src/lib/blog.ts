import { createClient } from "./supabase-server";
import type { Post, DevLog, Category, Tag } from "@/types/blog";

// ─── Posts ────────────────────────────────────────────────────────────────────

/** Published blog articles list */
export async function getPublishedPosts(opts?: {
  category?: string;
  tag?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Post[]> {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select(
      `
      id, title_en, title_bn, slug, excerpt_en, excerpt_bn,
      cover_image_url, published_at, read_time_min, is_featured, post_type,
      categories(id, name_en, name_bn, slug, color)
    `
    )
    .eq("status", "published")
    .eq("post_type", "blog")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  if (opts?.limit) query = query.limit(opts.limit);
  if (opts?.offset) query = query.range(opts.offset, (opts.offset + (opts.limit ?? 10)) - 1);
  if (opts?.category) query = query.eq("categories.slug", opts.category);
  if (opts?.search) {
    query = query.or(`title_en.ilike.%${opts.search}%,title_bn.ilike.%${opts.search}%,excerpt_en.ilike.%${opts.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Post[];
}

/** Single published post by slug */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      categories(id, name_en, name_bn, slug, color),
      post_tags(tags(id, name_en, name_bn, slug))
    `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .single();

  if (error) return null;
  return data as unknown as Post;
}

/** Related posts — same category, exclude current */
export async function getRelatedPosts(postId: string, categoryId: string | null, limit = 3): Promise<Post[]> {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select("id, title_en, title_bn, slug, excerpt_en, cover_image_url, published_at, read_time_min")
    .eq("status", "published")
    .eq("post_type", "blog")
    .neq("id", postId)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit);

  if (categoryId) query = query.eq("category_id", categoryId);

  const { data } = await query;
  return (data ?? []) as Post[];
}

/** All slugs — for static generation */
export async function getAllPostSlugs(): Promise<{ slug: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("slug")
    .eq("status", "published")
    .eq("post_type", "blog");
  return data ?? [];
}

// ─── Journal / Dev Logs ───────────────────────────────────────────────────────

export async function getJournalEntries(limit = 20, offset = 0): Promise<DevLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("development_logs")
    .select("*")
    .eq("is_public", true)
    .order("log_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return (data ?? []) as DevLog[];
}

export async function getJournalEntryByDate(dateStr: string): Promise<DevLog | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("development_logs")
    .select("*")
    .eq("log_date", dateStr)
    .eq("is_public", true)
    .single();
  return data as DevLog | null;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("name_en");
  return (data ?? []) as Category[];
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export async function getAllTags(): Promise<Tag[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("tags").select("*").order("name_en");
  return (data ?? []) as Tag[];
}

// ─── Sitemap helpers ──────────────────────────────────────────────────────────

export async function getAllPublishedPostsForSitemap() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("slug, updated_at, published_at, post_type")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString());
  return data ?? [];
}
