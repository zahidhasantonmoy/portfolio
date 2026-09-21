import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateContentWithFallback } from "@/lib/ai";

export const maxDuration = 60; // 60s for generating long content

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Neither GEMINI_API_KEY nor GROQ_API_KEY is configured in the environment." },
        { status: 500 }
      );
    }

    const { topic, provider } = await req.json();
    const targetTopic = topic?.trim() || "Modern Web Development with Next.js, React, and Full Stack Architecture";

    const prompt = `
You are Zahid Hasan Tonmoy, a passionate MERN Full Stack Developer and AI Agent Developer based in Dhaka, Bangladesh (studying B.Sc. in CSE at BUBT).
You are writing a comprehensive, high-quality, dual-language (English & Bangla) technical blog post for your personal developer portfolio website (https://zahidhasantonmoy.vercel.app).

TOPIC TO WRITE ABOUT:
"${targetTopic}"

REQUIREMENTS:
1. "slug": Clean, lowercase, hyphen-separated URL slug (e.g. "mastering-react-server-components").
2. "blog_url": "https://zahidhasantonmoy.vercel.app/blog/" + slug.
3. "english":
   - "title": Catchy, SEO-optimized English title.
   - "article": Full, in-depth technical article formatted in Markdown (headings H2/H3, bullet points, real code examples with syntax highlighting, best practices, at least 450-700 words).
4. "bangla":
   - "title": প্রাসঙ্গিক এবং আকর্ষণীয় বাংলা শিরোনাম।
   - "article": সম্পূর্ণ বিস্তারিত প্র্যাকটিক্যাল বাংলা আর্টিকেল (Markdown ফরম্যাটে, সহজবোধ্য ও প্রফেশনাল বাংলা ভাষা, কোড এক্সাম্পল সহ)।
5. "excerpt":
   - "english": Engaging 1-2 sentence English summary (max 160 chars).
   - "bangla": সংক্ষেপ বাংলা সারসংক্ষেপ (সর্বোচ্চ ১৫০ অক্ষর)।
6. "seo":
   - "meta_description_bn": বাংলা মেটা ডেসক্রিপশন (max 160 chars).
   - "seo_title_bn": বাংলা এসইও টাইটেল (max 60 chars).
   - "meta_description_en": English meta description (max 160 chars).
   - "seo_title_en": English SEO title (max 60 chars).
   - "primary_keyword": Target primary keyword.
   - "secondary_keywords": Array of 3-5 relevant keywords.
   - "search_intent": "informational" or "tutorial".
7. "social":
   - "linkedin_post": Engaging, professional LinkedIn post summary with key takeaways and hook.
   - "linkedin_hashtags": Array of 4-6 relevant hashtags (e.g. ["#WebDev", "#Nextjs", "#React"]).
   - "devto_title": Catchy title for DEV.to cross-posting.
   - "devto_article": Full DEV.to formatted markdown article.
   - "devto_tags": Array of 3-4 lowercase tags (e.g. ["webdev", "javascript", "react"]).
8. "thumbnail":
   - "prompt": Ultra-detailed prompt for AI cover image generation (cyberpunk, glassmorphism, or modern 3D dev workspace aesthetic, 16:9).
   - "text": Punchy 2-4 word text for the thumbnail overlay.
   - "aspect_ratio": "16:9".
9. "links":
   - "github": "https://github.com/zahidhasantonmoy",
   - "portfolio": "https://zahidhasantonmoy.vercel.app"
10. "branding":
   - "angle": 1-sentence personal developer branding angle highlighting practical engineering mastery.

STRICT JSON OUTPUT FORMAT (Respond ONLY with valid parseable JSON, no markdown code fence ticks around the root):
{
  "slug": "string",
  "blog_url": "string",
  "bangla": {
    "title": "string",
    "article": "string"
  },
  "english": {
    "title": "string",
    "article": "string"
  },
  "excerpt": {
    "english": "string",
    "bangla": "string"
  },
  "seo": {
    "meta_description_bn": "string",
    "seo_title_bn": "string",
    "meta_description_en": "string",
    "seo_title_en": "string",
    "primary_keyword": "string",
    "secondary_keywords": ["string"],
    "search_intent": "informational"
  },
  "social": {
    "linkedin_post": "string",
    "linkedin_hashtags": ["string"],
    "devto_title": "string",
    "devto_article": "string",
    "devto_tags": ["string"]
  },
  "thumbnail": {
    "prompt": "string",
    "text": "string",
    "aspect_ratio": "16:9"
  },
  "links": {
    "github": "https://github.com/zahidhasantonmoy",
    "portfolio": "https://zahidhasantonmoy.vercel.app"
  },
  "branding": {
    "angle": "string"
  }
}
`;

    const text = await generateContentWithFallback(
      prompt,
      "You are an expert full-stack developer and technical content creator. Return ONLY valid JSON matching the exact schema provided.",
      true,
      provider || "auto"
    );

    if (!text) {
      throw new Error("No response from AI provider");
    }

    // Clean any accidental markdown code fences
    const cleanedText = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/, "")
      .replace(/\s*```$/, "");

    const result = JSON.parse(cleanedText);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Post Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate post" },
      { status: 500 }
    );
  }
}
