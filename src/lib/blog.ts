import { sql } from "./db";
import type { Post, DevLog, Category, Tag } from "@/types/blog";

// ─── Helper: shape raw SQL rows into typed objects ─────────────────────────────

function toPost(row: Record<string, unknown>): Post {
  return {
    ...row,
    categories: row.cat_id
      ? {
          id: row.cat_id as string,
          name_en: row.cat_name_en as string,
          name_bn: row.cat_name_bn as string | null,
          slug: row.cat_slug as string,
          color: row.cat_color as string,
          description: null,
          created_at: "",
        }
      : null,
  } as unknown as Post;
}

// ─── Posts ────────────────────────────────────────────────────────────────────

/**
 * Automatically transitions any scheduled posts whose published_at time has arrived into 'published' status.
 */
export async function autoPublishScheduledPosts(): Promise<void> {
  try {
    await sql`
      UPDATE posts
      SET status = 'published', updated_at = NOW()
      WHERE status = 'scheduled' AND published_at <= NOW()
    `;
  } catch (err) {
    // Non-blocking catch to avoid build/runtime disruption
  }
}

export async function getPublishedPosts(opts?: {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Post[]> {
  const limit = opts?.limit ?? 10;
  const offset = opts?.offset ?? 0;

  try {
    // Lazy sync any due scheduled posts
    await autoPublishScheduledPosts();

    let rows;

    if (opts?.search && opts?.category) {
      rows = await sql`
        SELECT p.id, p.title_en, p.title_bn, p.slug, p.excerpt_en, p.excerpt_bn,
               p.cover_image_url, p.published_at, p.read_time_min, p.is_featured, p.post_type,
               c.id as cat_id, c.name_en as cat_name_en, c.name_bn as cat_name_bn,
               c.slug as cat_slug, c.color as cat_color
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE (p.status = 'published' OR (p.status = 'scheduled' AND p.published_at <= NOW()))
          AND p.post_type = 'blog'
          AND p.published_at <= NOW()
          AND c.slug = ${opts.category}
          AND (p.title_en ILIKE ${'%' + opts.search + '%'}
            OR p.title_bn ILIKE ${'%' + opts.search + '%'}
            OR p.excerpt_en ILIKE ${'%' + opts.search + '%'})
        ORDER BY p.published_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (opts?.search) {
      rows = await sql`
        SELECT p.id, p.title_en, p.title_bn, p.slug, p.excerpt_en, p.excerpt_bn,
               p.cover_image_url, p.published_at, p.read_time_min, p.is_featured, p.post_type,
               c.id as cat_id, c.name_en as cat_name_en, c.name_bn as cat_name_bn,
               c.slug as cat_slug, c.color as cat_color
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE (p.status = 'published' OR (p.status = 'scheduled' AND p.published_at <= NOW()))
          AND p.post_type = 'blog'
          AND p.published_at <= NOW()
          AND (p.title_en ILIKE ${'%' + opts.search + '%'}
            OR p.title_bn ILIKE ${'%' + opts.search + '%'}
            OR p.excerpt_en ILIKE ${'%' + opts.search + '%'})
        ORDER BY p.published_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (opts?.category) {
      rows = await sql`
        SELECT p.id, p.title_en, p.title_bn, p.slug, p.excerpt_en, p.excerpt_bn,
               p.cover_image_url, p.published_at, p.read_time_min, p.is_featured, p.post_type,
               c.id as cat_id, c.name_en as cat_name_en, c.name_bn as cat_name_bn,
               c.slug as cat_slug, c.color as cat_color
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE (p.status = 'published' OR (p.status = 'scheduled' AND p.published_at <= NOW()))
          AND p.post_type = 'blog'
          AND p.published_at <= NOW()
          AND c.slug = ${opts.category}
        ORDER BY p.published_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      rows = await sql`
        SELECT p.id, p.title_en, p.title_bn, p.slug, p.excerpt_en, p.excerpt_bn,
               p.cover_image_url, p.published_at, p.read_time_min, p.is_featured, p.post_type,
               c.id as cat_id, c.name_en as cat_name_en, c.name_bn as cat_name_bn,
               c.slug as cat_slug, c.color as cat_color
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE (p.status = 'published' OR (p.status = 'scheduled' AND p.published_at <= NOW()))
          AND p.post_type = 'blog'
          AND p.published_at <= NOW()
        ORDER BY p.published_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    return rows.map((r) => toPost(r as Record<string, unknown>));
  } catch (err) {
    console.warn("[getPublishedPosts] Database unreachable, returning fallback []:", err);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const rows = await sql`
      SELECT p.*,
             c.id as cat_id, c.name_en as cat_name_en, c.name_bn as cat_name_bn,
             c.slug as cat_slug, c.color as cat_color
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ${slug}
        AND (p.status = 'published' OR (p.status = 'scheduled' AND p.published_at <= NOW()))
        AND p.published_at <= NOW()
      LIMIT 1
    `;
    if (!rows.length) return null;

    const post = toPost(rows[0] as Record<string, unknown>);

    // Fetch tags
    const tagRows = await sql`
      SELECT t.id, t.name_en, t.name_bn, t.slug
      FROM post_tags pt
      JOIN tags t ON pt.tag_id = t.id
      WHERE pt.post_id = ${post.id}
    `;
    post.post_tags = tagRows.map((t) => ({
      tags: t as unknown as Tag,
    }));

    return post;
  } catch (err) {
    console.warn(`[getPostBySlug] Failed to fetch slug ${slug}:`, err);
    return null;
  }
}

export async function getRelatedPosts(
  postId: string,
  categoryId: string | null,
  limit = 3
): Promise<Post[]> {
  if (!categoryId) {
    const rows = await sql`
      SELECT id, title_en, title_bn, slug, excerpt_en, cover_image_url, published_at, read_time_min
      FROM posts
      WHERE (status = 'published' OR (status = 'scheduled' AND published_at <= NOW()))
        AND post_type = 'blog'
        AND id != ${postId} AND published_at <= NOW()
      ORDER BY published_at DESC
      LIMIT ${limit}
    `;
    return rows as unknown as Post[];
  }

  const rows = await sql`
    SELECT id, title_en, title_bn, slug, excerpt_en, cover_image_url, published_at, read_time_min
    FROM posts
    WHERE (status = 'published' OR (status = 'scheduled' AND published_at <= NOW()))
      AND post_type = 'blog'
      AND id != ${postId} AND category_id = ${categoryId} AND published_at <= NOW()
    ORDER BY published_at DESC
    LIMIT ${limit}
  `;
  return rows as unknown as Post[];
}

export async function getAllPostSlugs(): Promise<{ slug: string }[]> {
  try {
    const rows = await sql`
      SELECT slug FROM posts
      WHERE (status = 'published' OR (status = 'scheduled' AND published_at <= NOW()))
        AND post_type = 'blog'
    `;
    return rows as { slug: string }[];
  } catch (err) {
    console.warn("[getAllPostSlugs] Database not reachable during build, fallback to empty list:", err);
    return [];
  }
}


// ─── Journal ──────────────────────────────────────────────────────────────────

export async function getJournalEntries(
  limit = 20,
  offset = 0
): Promise<DevLog[]> {
  try {
    const rows = await sql`
      SELECT * FROM development_logs
      WHERE is_public = true
      ORDER BY log_date DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return rows as unknown as DevLog[];
  } catch (err) {
    console.warn("[getJournalEntries] Database unreachable:", err);
    return [];
  }
}

export async function getJournalEntryByDate(
  dateStr: string
): Promise<DevLog | null> {
  try {
    const rows = await sql`
      SELECT * FROM development_logs
      WHERE log_date = ${dateStr} AND is_public = true
      LIMIT 1
    `;
    return rows.length ? (rows[0] as unknown as DevLog) : null;
  } catch (err) {
    console.warn("[getJournalEntryByDate] Database unreachable:", err);
    return null;
  }
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  try {
    const rows = await sql`SELECT * FROM categories ORDER BY name_en`;
    return rows as unknown as Category[];
  } catch (err) {
    console.warn("[getCategories] Database unreachable:", err);
    return [];
  }
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export async function getAllTags(): Promise<Tag[]> {
  try {
    const rows = await sql`SELECT * FROM tags ORDER BY name_en`;
    return rows as unknown as Tag[];
  } catch (err) {
    console.warn("[getAllTags] Database unreachable:", err);
    return [];
  }
}

// ─── Sitemap ──────────────────────────────────────────────────────────────────

export async function getAllPublishedPostsForSitemap() {
  try {
    const rows = await sql`
      SELECT slug, updated_at, published_at, post_type, cover_image_url, title_en, title_bn, excerpt_en, excerpt_bn
      FROM posts
      WHERE (status = 'published' OR (status = 'scheduled' AND published_at <= NOW()))
        AND published_at <= NOW()
    `;
    return rows;
  } catch (err) {
    console.warn("[getAllPublishedPostsForSitemap] Database not reachable during build:", err);
    return [];
  }
}

// ─── Adjacent Posts (Previous & Next Navigation) ──────────────────────────────

export interface AdjacentPosts {
  prev: { title_en: string; title_bn?: string | null; slug: string } | null;
  next: { title_en: string; title_bn?: string | null; slug: string } | null;
}

export async function getAdjacentPosts(
  currentPostId: string,
  publishedAt?: string | null
): Promise<AdjacentPosts> {
  try {
    const pubDate = publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString();

    const [prevRows, nextRows] = await Promise.all([
      sql`
        SELECT title_en, title_bn, slug
        FROM posts
        WHERE (status = 'published' OR (status = 'scheduled' AND published_at <= NOW()))
          AND post_type = 'blog'
          AND published_at <= NOW()
          AND id != ${currentPostId}
          AND published_at < ${pubDate}
        ORDER BY published_at DESC
        LIMIT 1
      `.catch(() => []),
      sql`
        SELECT title_en, title_bn, slug
        FROM posts
        WHERE (status = 'published' OR (status = 'scheduled' AND published_at <= NOW()))
          AND post_type = 'blog'
          AND published_at <= NOW()
          AND id != ${currentPostId}
          AND published_at > ${pubDate}
        ORDER BY published_at ASC
        LIMIT 1
      `.catch(() => []),
    ]);

    return {
      prev: (prevRows[0] as any) || null,
      next: (nextRows[0] as any) || null,
    };
  } catch (err) {
    console.warn("[getAdjacentPosts] Database unreachable:", err);
    return { prev: null, next: null };
  }
}

// ─── FAQ Schema & Extraction for GEO / AI Overviews ───────────────────────────

export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Extracts FAQ pairs from Markdown content.
 * Looks for ## Frequently Asked Questions / ## FAQ / ## প্রায়শই জিজ্ঞাসিত প্রশ্নাবলী
 * followed by ### Question headings or **Q:** bullet points.
 */
export function extractFaqsFromMarkdown(markdown: string): FAQItem[] {
  if (!markdown) return [];

  const faqs: FAQItem[] = [];

  // Match the FAQ section header (supports ## FAQ, ## Frequently Asked Questions, ## প্রায়শই জিজ্ঞাসিত প্রশ্নাবলী (FAQ), etc.)
  const faqHeaderRegex = /##\s+[^\n\r]*(?:Frequently Asked Questions|FAQs?|FAQ|প্রায়শই জিজ্ঞাসিত প্রশ্নাবলী|সাধারণ জিজ্ঞাসা|প্রশ্নোত্তর)[^\n\r]*(?:\r?\n)+([\s\S]*?)(?=(?:^##\s+)|$)/im;
  const match = markdown.match(faqHeaderRegex);
  const faqSection = match ? match[1] : markdown;

  // Pattern 1: Heading 3 or 4 questions (### Question? followed by answer)
  const headingQuestionRegex = /###+\s+(?:Q\d*[:.-]?\s*)?([^\n\r]+?)(?:\r?\n)+([\s\S]*?)(?=(?:^###+\s+)|(?:^##\s+)|$)/gim;
  let qMatch;
  while ((qMatch = headingQuestionRegex.exec(faqSection)) !== null) {
    const question = qMatch[1].trim().replace(/^[*_]+|[*_]+$/g, "");
    const rawAnswer = qMatch[2].trim();
    // Clean basic markdown from answer for clean schema text
    const cleanAnswer = rawAnswer
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Strip links
      .replace(/[*_`#]/g, "") // Strip formatting chars
      .replace(/\n\s*\n/g, " ") // Collapse newlines
      .trim();

    if (question && cleanAnswer && question.length > 5 && cleanAnswer.length > 10) {
      faqs.push({ question, answer: cleanAnswer });
    }
  }

  // Pattern 2: Bold Q: / A: format (**Q:** ... **A:** ...)
  if (faqs.length === 0) {
    const qaBlockRegex = /(?:\*\*Q[:.-]?\s*|\*\*প্রশ্ন[:.-]?\s*)([^\*\n]+?)\*\*(?:\r?\n|\s+)+(?:\*\*A[:.-]?\s*|\*\*উত্তর[:.-]?\s*|A:\s*|উত্তর:\s*)([\s\S]*?)(?=(?:\*\*Q[:.-]?)|(?:\*\*প্রশ্ন[:.-]?)|(?:^##)|$)/gi;
    let qaMatch;
    while ((qaMatch = qaBlockRegex.exec(faqSection)) !== null) {
      const question = qaMatch[1].trim();
      const rawAnswer = qaMatch[2].trim();
      const cleanAnswer = rawAnswer
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[*_`#]/g, "")
        .replace(/\n\s*\n/g, " ")
        .trim();

      if (question && cleanAnswer) {
        faqs.push({ question, answer: cleanAnswer });
      }
    }
  }

  return faqs;
}

/**
 * Builds Schema.org FAQPage structured data from FAQ items.
 */
export function generateFaqSchema(faqs: FAQItem[]) {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
