import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateContentWithFallback } from "@/lib/ai";

export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, content, slug, tags = [], provider } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Post title and content are required." },
        { status: 400 }
      );
    }

    const postUrl = slug
      ? `https://zahidhasantonmoy.vercel.app/blog/${slug}`
      : "https://zahidhasantonmoy.vercel.app/blog";

    const promptInput = `
Title: ${title}
Tags: ${tags.join(", ") || "WebDev, Programming"}
Canonical URL: ${postUrl}
Article Text: ${content.substring(0, 3500)}
    `;

    const systemInstruction = `You are a social media growth strategist for top software engineers and tech founders.
Convert the provided tech article into optimized, high-engagement formats tailored specifically for LinkedIn, DEV.to, Medium, and Twitter / X.

Format requirements:
1. LinkedIn:
   - Punchy, scroll-stopping 1-line hook.
   - White space between short paragraphs.
   - 3 to 5 clear bullet points or key takeaways with relevant emojis (💡, ⚡, 📌).
   - Thought-provoking closing question to invite comments.
   - Clear CTA directing to the full article: "${postUrl}?utm_source=linkedin&utm_medium=social".
   - 4-5 high-volume hashtags.
2. DEV.to:
   - Engaging title.
   - Clean markdown body summarized or formatted with headings.
   - Array of max 4 lowercase alphanumeric tags.
3. Medium:
   - Catchy story title and subtitle.
   - Markdown formatted story body.
   - Array of 4-5 tags.
4. Twitter / X:
   - Catchy standalone single tweet under 260 characters with link & 2 hashtags.
   - 3-part thread breaking down the core idea.

Respond ONLY with a valid JSON object matching this exact schema, with NO markdown fences:
{
  "linkedin": {
    "post": "Hook string\\n\\nBody with takeaways\\n\\nClosing CTA",
    "hashtags": ["#WebDev", "#React", "#FullStack", "#SoftwareEngineering"],
    "hook": "Single line hook"
  },
  "devto": {
    "title": "Article title for DEV.to",
    "article": "Full markdown body for DEV.to",
    "tags": ["webdev", "javascript", "react", "programming"]
  },
  "medium": {
    "title": "Story Title",
    "subtitle": "Story Subtitle",
    "story": "Markdown story content",
    "tags": ["Software Development", "Web Development", "Programming", "Technology"]
  },
  "twitter": {
    "tweet": "Single tweet under 260 chars with link",
    "thread": [
      "Tweet 1/3: Hook...",
      "Tweet 2/3: Key insight...",
      "Tweet 3/3: Read more here..."
    ]
  }
}`;

    const text = await generateContentWithFallback(
      promptInput,
      systemInstruction,
      true,
      provider || "auto"
    );

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error("Invalid JSON format received from AI.");
      }
    }

    return NextResponse.json({ success: true, social: parsed });
  } catch (error: unknown) {
    console.error("[generate-social] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate social content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
