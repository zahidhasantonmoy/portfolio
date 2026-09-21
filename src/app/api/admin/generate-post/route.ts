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
    const todayDate = new Date().toISOString().split("T")[0];

    const prompt = `
You are Zahid Hasan Tonmoy, a passionate MERN Full Stack Developer and AI Agent Developer based in Dhaka, Bangladesh (studying B.Sc. in CSE at BUBT).
You are writing a comprehensive, high-quality, dual-language (English & Bangla) technical blog post for your personal developer portfolio website (https://zahidhasantonmoy.vercel.app).

TOPIC TO WRITE ABOUT:
"${targetTopic}"

TODAY'S PUBLISHING DATE:
"${todayDate}"

REQUIREMENTS:
1. "slug": Clean, lowercase, hyphen-separated URL slug (e.g. "mastering-react-server-components").
2. "canonical_url": "https://zahidhasantonmoy.vercel.app/blog/" + slug.
3. "language_alternate":
   - "en": "https://zahidhasantonmoy.vercel.app/blog/" + slug
   - "bn": "https://zahidhasantonmoy.vercel.app/bn/blog/" + slug
4. "published_date": "${todayDate}".
5. "updated_date": "${todayDate}".
6. "author": "Zahid Hasan Tonmoy".
7. "status": "draft" (for editorial review).
8. "category": A recommended category slug (e.g. "ai-agent-development", "react-nextjs", "web-development", "system-design", "database-engineering").
9. "tags": Array of 3-5 lowercase relevant tags (e.g. ["nextjs", "react", "typescript", "ai-agent"]).
10. "english":
   - "title": Catchy, SEO-optimized English title.
   - "article": Full, in-depth technical article formatted in Markdown (headings H2/H3, bullet points, real code examples with syntax highlighting, best practices, at least 500-750 words).
   - At the end of the article, include:
     ## Frequently Asked Questions
     ### Question 1?
     Answer 1...
     ### Question 2?
     Answer 2...
11. "bangla":
   - "title": প্রাসঙ্গিক এবং আকর্ষণীয় বাংলা শিরোনাম।
   - "article": সম্পূর্ণ বিস্তারিত প্র্যাকটিক্যাল বাংলা আর্টিকেল (Markdown ফরম্যাটে, সহজবোধ্য ও প্রফেশনাল বাংলা ভাষা, কোড এক্সাম্পল সহ)।
   - আর্টিকেলের শেষে যোগ করুন:
     ## প্রায়শই জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
     ### প্রশ্ন ১?
     উত্তর ১...
     ### প্রশ্ন ২?
     উত্তর ২...
12. "faq": Array of 2-3 focused Q&As for Google FAQPage schema and GEO (AI Overviews/ChatGPT):
   [
     {
       "question_en": "Question in English?",
       "answer_en": "Direct, authoritative technical answer in English.",
       "question_bn": "বাংলায় প্রশ্ন?",
       "answer_bn": "সহজবোধ্য ও সঠিক বাংলা উত্তর।"
     }
   ]
13. "excerpt":
   - "english": Engaging 1-2 sentence English summary (max 160 chars).
   - "bangla": সংক্ষেপ বাংলা সারসংক্ষেপ (সর্বোচ্চ ১৫০ অক্ষর)।
14. "seo":
   - "meta_description_bn": বাংলা মেটা ডেসক্রিপশন (max 160 chars).
   - "seo_title_bn": বাংলা এসইও টাইটেল (max 60 chars).
   - "meta_description_en": English meta description (max 160 chars).
   - "seo_title_en": English SEO title (max 60 chars).
   - "primary_keyword": Target primary keyword.
   - "secondary_keywords": Array of 3-5 relevant keywords.
   - "search_intent": "informational" or "tutorial".
15. "social":
   - "linkedin_post": Engaging, professional LinkedIn post summary with key takeaways and hook.
   - "linkedin_hashtags": Array of 4-6 relevant hashtags (e.g. ["#WebDev", "#Nextjs", "#React"]).
   - "devto_title": Catchy title for DEV.to cross-posting.
   - "devto_article": Full DEV.to formatted markdown article.
   - "devto_tags": Array of 3-4 lowercase tags (e.g. ["webdev", "javascript", "react"]).
16. "thumbnail":
   - "prompt": Ultra-detailed prompt for AI cover image generation (16:9, modern dev workspace, cyberpunk/glassmorphism aesthetic).
   - "text": Punchy 2-4 word text for thumbnail overlay.
   - "aspect_ratio": "16:9".
17. "og_image": "https://zahidhasantonmoy.vercel.app/blog/" + slug + "/opengraph-image".
18. "branding":
   - "angle": 1-sentence personal developer branding angle highlighting engineering excellence.

STRICT JSON OUTPUT FORMAT (Respond ONLY with valid parseable JSON, no markdown code fences around root):
{
  "slug": "string",
  "canonical_url": "string",
  "language_alternate": {
    "en": "string",
    "bn": "string"
  },
  "published_date": "string",
  "updated_date": "string",
  "author": "Zahid Hasan Tonmoy",
  "status": "draft",
  "category": "string",
  "tags": ["string"],
  "english": {
    "title": "string",
    "article": "string"
  },
  "bangla": {
    "title": "string",
    "article": "string"
  },
  "faq": [
    {
      "question_en": "string",
      "answer_en": "string",
      "question_bn": "string",
      "answer_bn": "string"
    }
  ],
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
  "og_image": "string",
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

    // Safeguard & guarantee all 8 SEO/GEO attributes
    const slug = result.slug || "post-" + Date.now();
    result.slug = slug;
    result.canonical_url = result.canonical_url || `https://zahidhasantonmoy.vercel.app/blog/${slug}`;
    result.language_alternate = result.language_alternate || {
      en: `https://zahidhasantonmoy.vercel.app/blog/${slug}`,
      bn: `https://zahidhasantonmoy.vercel.app/bn/blog/${slug}`,
    };
    result.published_date = result.published_date || todayDate;
    result.updated_date = result.updated_date || todayDate;
    result.author = result.author || "Zahid Hasan Tonmoy";
    result.status = result.status || "draft";
    result.og_image = result.og_image || `https://zahidhasantonmoy.vercel.app/blog/${slug}/opengraph-image`;

    // Compute word count & reading time
    const enWords = result.english?.article ? result.english.article.trim().split(/\s+/).length : 0;
    const bnWords = result.bangla?.article ? result.bangla.article.trim().split(/\s+/).length : 0;
    result.word_count = {
      english: enWords,
      bangla: bnWords,
    };
    result.reading_time_minutes = Math.max(1, Math.ceil(enWords / 200));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Post Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate post" },
      { status: 500 }
    );
  }
}
