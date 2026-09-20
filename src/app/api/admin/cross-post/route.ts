/**
 * POST /api/admin/cross-post
 * Cross-posts a blog article to DEV.to as a draft.
 * Requires DEVTO_API_KEY in environment variables.
 *
 * Body:
 *   platform  : "devto"
 *   title     : string
 *   content   : string (Markdown)
 *   tags      : string[] (max 4 for DEV.to)
 *   canonicalUrl : string (your portfolio blog URL — critical for SEO)
 *   coverImage?: string
 *   description?: string
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  // Auth guard — admin only
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { platform, title, content, tags = [], canonicalUrl, coverImage, description } = body;

    if (!platform || !title || !content) {
      return NextResponse.json(
        { error: "platform, title, and content are required." },
        { status: 400 }
      );
    }

    if (platform === "devto") {
      return await crossPostToDevTo({ title, content, tags, canonicalUrl, coverImage, description });
    }

    return NextResponse.json({ error: `Unsupported platform: ${platform}` }, { status: 400 });

  } catch (err: unknown) {
    console.error("[CrossPost] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Cross-post failed" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────
// DEV.to Integration
// Docs: https://developers.forem.com/api/v1
// ─────────────────────────────────────────
async function crossPostToDevTo({
  title,
  content,
  tags,
  canonicalUrl,
  coverImage,
  description,
}: {
  title: string;
  content: string;
  tags: string[];
  canonicalUrl?: string;
  coverImage?: string;
  description?: string;
}) {
  const apiKey = process.env.DEVTO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "DEVTO_API_KEY is not configured." }, { status: 500 });
  }

  // DEV.to accepts max 4 tags, must be lowercase letters/numbers/hyphens
  const cleanTags = tags
    .slice(0, 4)
    .map((t) => t.toLowerCase().replace(/[^a-z0-9-]/g, "").trim())
    .filter(Boolean);

  const articlePayload: Record<string, unknown> = {
    article: {
      title,
      body_markdown: content,
      published: false, // Always draft first — review before publishing
      tags: cleanTags,
      ...(canonicalUrl && { canonical_url: canonicalUrl }),
      ...(description && { description }),
      ...(coverImage && { main_image: coverImage }),
    },
  };

  const res = await fetch("https://dev.to/api/articles", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(articlePayload),
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || JSON.stringify(data);
    console.error("[DEV.to] API error:", errorMsg);
    return NextResponse.json(
      { error: `DEV.to API error: ${errorMsg}` },
      { status: res.status }
    );
  }

  return NextResponse.json({
    success: true,
    platform: "devto",
    id: data.id,
    url: data.url,
    status: data.published ? "published" : "draft",
    title: data.title,
  });
}
