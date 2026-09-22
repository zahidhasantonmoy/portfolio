import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60s max execution

/**
 * Validates request authorization:
 * - Recommended & Secure: Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`
 * - Custom Header: External crons (cron-job.org / GitHub Actions) can send `x-cron-secret`
 * - Logged-in admin session (NextAuth) is also permitted
 * - Query param (?secret=) is deprecated in production to prevent plain-text leak in server access logs & analytics
 */
async function isAuthorized(req: Request): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;
  const isProd = process.env.NODE_ENV === "production";

  // Check Bearer token or custom header (most secure — no URL logging)
  const authHeader = req.headers.get("authorization");
  const xCronSecret = req.headers.get("x-cron-secret");

  if (cronSecret) {
    if (authHeader === `Bearer ${cronSecret}` || xCronSecret === cronSecret) {
      return true;
    }
  }

  // Check admin session
  try {
    const session = await getServerSession(authOptions);
    if (session) return true;
  } catch {
    // Session check failed or unauthenticated
  }

  // In development only, allow localhost or dev query-secret for testing convenience
  if (!isProd) {
    const { searchParams } = new URL(req.url);
    const querySecret = searchParams.get("secret");
    if (cronSecret && querySecret === cronSecret) {
      console.warn("[Cron Auth] Notice: Using query-param secret in development. In production, use 'Authorization: Bearer <CRON_SECRET>' or 'x-cron-secret' header.");
      return true;
    }
    return true; // localhost convenience in dev
  }

  return false;
}

async function handleScheduledPublish(req: Request) {
  const authorized = await isAuthorized(req);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 });
  }

  try {
    // 1. Find all scheduled posts that are due for publishing
    const duePosts = await sql`
      SELECT id, slug, post_type, title_en, published_at
      FROM posts
      WHERE status = 'scheduled' AND published_at <= NOW()
    `;

    if (!duePosts || duePosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No scheduled posts due for publication.",
        publishedCount: 0,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Transition due posts to 'published'
    const updated = await sql`
      UPDATE posts
      SET status = 'published', updated_at = NOW()
      WHERE status = 'scheduled' AND published_at <= NOW()
      RETURNING id, slug, post_type, title_en, published_at
    `;

    // 3. Trigger on-demand revalidation for all relevant routes
    const revalidatedPaths: string[] = [
      "/blog",
      "/bn/blog",
      "/journal",
      "/",
      "/feed.xml",
      "/rss.xml",
      "/sitemap.xml",
      "/sitemap-images.xml",
    ];

    for (const path of revalidatedPaths) {
      try {
        revalidatePath(path);
      } catch (err) {
        console.warn(`[Cron Revalidate] Error revalidating path ${path}:`, err);
      }
    }

    // Revalidate individual post routes for each newly published post
    for (const post of updated) {
      if (post.post_type === "blog" && post.slug) {
        const blogPathEn = `/blog/${post.slug}`;
        const blogPathBn = `/bn/blog/${post.slug}`;
        try {
          revalidatePath(blogPathEn, "page");
          revalidatePath(blogPathBn, "page");
          revalidatedPaths.push(blogPathEn, blogPathBn);
        } catch (err) {
          console.warn(`[Cron Revalidate] Error revalidating slug ${post.slug}:`, err);
        }
      } else if (post.post_type === "journal") {
        try {
          revalidatePath("/journal", "page");
        } catch (err) {
          console.warn(`[Cron Revalidate] Error revalidating journal:`, err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully published ${updated.length} scheduled post(s) and revalidated cache.`,
      publishedCount: updated.length,
      publishedPosts: updated.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title_en,
        published_at: p.published_at,
      })),
      revalidatedPaths,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Cron Publish Scheduled Error]:", error);
    return NextResponse.json(
      {
        error: "Failed to publish scheduled posts",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return handleScheduledPublish(req);
}

export async function POST(req: Request) {
  return handleScheduledPublish(req);
}
