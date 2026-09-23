import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateContentWithFallback } from "@/lib/ai";
import { getPostBySlug } from "@/lib/blog";

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

    const {
      topic,
      provider,
      series: incomingSeries,
      prev_post_slug,
      prev_post_title_bn,
    } = await req.json();

    const targetTopic = topic?.trim() || "Modern Web Development with Next.js, React, and Full Stack Architecture";
    const todayDate = new Date().toISOString().split("T")[0];

    // Safely resolve genuine previous post title from DB without hallucination
    const resolvedPrevSlug = incomingSeries?.prev_post_slug || prev_post_slug || null;
    let resolvedPrevTitle = incomingSeries?.prev_post_title_bn || prev_post_title_bn || null;

    if (resolvedPrevSlug && !resolvedPrevTitle) {
      if (resolvedPrevSlug === "mastering-autonomous-ai-agents") {
        resolvedPrevTitle = "নেক্সট জেএস ও ল্যাংচেইন দিয়ে স্বয়ংক্রিয় এআই এজেন্ট ডেভেলপমেন্ট";
      } else {
        try {
          const prevPost = await getPostBySlug(resolvedPrevSlug);
          if (prevPost?.title_bn) {
            resolvedPrevTitle = prevPost.title_bn;
          }
        } catch (err) {
          console.warn("[generate-post] DB lookup fallback for prev post:", err);
        }
      }
    }

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
8. "category": A recommended cluster category slug strictly using kebab-case (e.g. "ai-agent-fundamentals", "ai-agent-advanced", "react-nextjs", "web-development", "system-design", "database-engineering").
9. "tags": Array of 3-5 lowercase relevant tags (e.g. ["nextjs", "react", "typescript", "ai-agent"]).
10. "english":
   - "title": Catchy, SEO-optimized English title.
   - "article": Full, authoritative, in-depth technical article formatted in Markdown (clear H2/H3 headings, actionable technical insights, architectural explanations, best practices, at least 1,200 to 1,800 words). MUST contain real, production-ready code blocks with syntax highlighting (\`\`\`tsx or \`\`\`typescript) demonstrating step-by-step implementation, configuration, and practical usage (not generic pseudo-code).
   - Mermaid Diagrams & GEO Visibility Rule: When illustrating system architecture, sequence flows, data pipelines, execution loops, or step-by-step processes, you MUST use native Markdown \`\`\`mermaid code blocks. CRITICAL: Immediately beneath every \`\`\`mermaid block, you MUST provide a concise 1-2 sentence plain-text architecture flow summary prefixed with '*Architecture Flow Summary:*' (e.g. '*Architecture Flow Summary: Client Request → Next.js Route Handler → LangChain Orchestrator → Tool Execution → Streamed Response.*'). This ensures non-JS AI search engines and crawler bots (ChatGPT, Perplexity, ClaudeBot) extract and index the complete semantic flow directly from raw HTML.
   - Visual placement markers: Insert placement markers like {{IMAGE:img-1}}, {{IMAGE:img-2}} ONLY where a purely decorative/atmospheric hero-style visual (NO flow, NO steps, NO lifecycle) genuinely adds mood or aesthetic value (limit 2 max). NEVER insert {{IMAGE:img-N}} to represent an architecture diagram, execution lifecycle, streaming pipeline, or data flow — those MUST be \`\`\`mermaid blocks.
   - At the end of the article, include:
     ## Frequently Asked Questions
     ### Question 1?
     Answer 1...
     ### Question 2?
     Answer 2...
11. "bangla":
   - "title": প্রাসঙ্গিক এবং আকর্ষণীয় বাংলা শিরোনাম।
   - "article": সম্পূর্ণ বিস্তারিত প্র্যাকটিক্যাল বাংলা আর্টিকেল (Markdown ফরম্যাটে, সহজবোধ্য ও প্রফেশনাল বাংলা ভাষা, অন্তত ১২০০-১৮০০ শব্দ)। আর্টিকেলে প্র্যাকটিক্যাল কোড এক্সাম্পল ও সিনট্যাক্স হাইলাইটিং (\`\`\`tsx বা \`\`\`typescript) সহ বাস্তবসম্মত ইমপ্লিমেন্টেশন কোড ও ব্যাখ্যা থাকতে হবে।
   - Mermaid ডায়াগ্রাম ও GEO নিয়ম: আর্কিটেকচার, ডেটা পাইপলাইন বা সিকোয়েন্স ফ্লো বোঝাতে নেটিভ Markdown \`\`\`mermaid ব্লক ব্যবহার করুন। ক্রলার ও GEO (ChatGPT, Perplexity, ClaudeBot)-এর দৃশ্যমানতার জন্য প্রতিটা \`\`\`mermaid ব্লকের ঠিক নিচেই বাধ্যতামূলকভাবে ১-২ লাইনের সহজবোধ্য প্লেইন-টেক্সট আর্কিটেকচার ফ্লো সামারি দিন (যেমন: '*আর্কিটেকচার ফ্লো সামারি: ক্লায়েন্ট রিকোয়েস্ট → নেক্সট জেএস এপিআই রুট → ল্যাংচেইন এজেন্ট → টুল এক্সেকিউশন → স্ট্রিমড রেসপন্স।*')।
   - ভিজ্যুয়াল প্লেসমেন্ট মার্কার: শুধুমাত্র পিউর ডেকোরেটিভ/অ্যাটমোসফেরিক ভিজ্যুয়ালের জন্য {{IMAGE:img-1}}, {{IMAGE:img-2}} মার্কার বসানো যাবে (সর্বোচ্চ ২টি)। আর্কিটেকচার ডায়াগ্রাম, ফ্লোচার্ট, এক্সিকিউশন লুপ বা ডেটা পাইপলাইন দেখানোর জন্য কখনো {{IMAGE}} মার্কার দেবেন না — সেগুলো অবশ্যই \\\`\\\`\\\`mermaid ব্লক হবে।
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
   - "primary_keyword_en": Natural human search query (e.g. "How to build AI Agents with Next.js" or "Next.js AI Agents Tutorial") matching real search intent. Avoid unnatural robotic sequences like "AI Agents Next.js".
   - "secondary_keywords_en": Array of 3-5 distinct semantic variants (e.g. ["LangChain autonomous agent architecture", "Next.js AI streaming tool calling", "production AI workflows"]) that support the topic WITHOUT repeating or cannibalizing the primary keyword phrase.
   - "primary_keyword_bn": প্রাকৃতিক ও জনপ্রিয় বাংলা সার্চ কোয়েরি (যেমন: "নেক্সট জেএস দিয়ে এআই এজেন্ট তৈরি" বা "অটোনোমাস এআই এজেন্ট টিউটোরিয়াল")।
   - "secondary_keywords_bn": ৩-৪টি স্বতন্ত্র বাংলা সার্চ টার্ম (যেমন: ["স্বয়ংক্রিয় এআই এজেন্ট টিউটোরিয়াল", "ল্যাংচেইন দিয়ে এআই এজেন্ট", "নেক্সট জেএস টিউটোরিয়াল বাংলা"])। অকেজো বা কৃত্রিম "শব্দ + বাংলা" ফরম্যাট (যেমন: "ল্যাংচেইন বাংলা") পরিহার করে ব্যবহারকারীর সার্চ ইনটেন্ট অনুযায়ী সম্পূর্ণ অর্থপূর্ণ ও স্বাভাবিক বাংলা সার্চ ফ্রেজ লিখুন।
   - "search_intent": Must be strictly one of: "informational" | "tutorial" | "comparison" | "transactional".
15. "social":
   - "linkedin_post_en": Engaging, professional LinkedIn post summary in English with key takeaways, hook, and code insight.
   - "linkedin_hashtags_en": Array of 4-6 relevant English hashtags (e.g. ["#WebDev", "#Nextjs", "#React"]).
   - "linkedin_post_bn": বাংলাদেশি ও বাংলাভাষী অডিয়েন্সের জন্য প্রাঞ্জল ও আকর্ষণীয় বাংলা লিঙ্কডইন পোস্ট (hook, key takeaways, এবং portfolio link সহ)।
   - "linkedin_hashtags_bn": ৪-৬টি প্রাসঙ্গিক বাংলা ও আন্তর্জাতিক হ্যাশট্যাগ (যেমন: ["#ওয়েবডেভেলপমেন্ট", "#নেক্সটজেএস", "#প্রোগ্রামিং", "#TechBangladesh"]).
   - "devto_title": Catchy title for DEV.to cross-posting.
   - "devto_article": Full DEV.to formatted markdown article.
   - "devto_tags": Array of 3-4 lowercase tags (e.g. ["webdev", "javascript", "react"]).
16. "thumbnail":
   - "prompt": Ultra-detailed prompt for AI cover image generation (16:9, modern dev workspace, glassmorphism, cyan and purple neon palette, volumetric lighting, 8k render, octane render, no text).
   - "text": Punchy 2-4 word text for thumbnail overlay.
   - "aspect_ratio": "16:9".
17. "content_images": (OPTIONAL — maximum 2 images per post, use VERY sparingly — omit entirely if unsure)
   ⚠️ STRICT RULE — content_images is ONLY for purely decorative, atmospheric, hero-style concept art with NO informational meaning.
   ❌ NEVER put in content_images: execution lifecycle, streaming pipeline, agent flow, architecture overview, sequence diagram, data flow, step-by-step process — these MUST be \`\`\`mermaid blocks in the article body.
   ✅ ALLOWED in content_images: "Abstract glowing distributed network of nodes" / "Futuristic dark workspace with neon code streams" / "Glassmorphism UI concept floating in space" — pure visual mood only.
   ❌ NOT ALLOWED captions like: "Figure 1: Agent Execution Lifecycle" / "Streaming Architecture Diagram" / "High-level Workflow Overview" — if you need those, use \`\`\`mermaid instead.
   If and only if a decorative visual is needed, insert {{IMAGE:img-N}} in the article and add a matching entry:
   [
     {
       "id": "img-1",
       "placement_marker": "{{IMAGE:img-1}}",
       "prompt": "Detailed AI image-generation prompt in the SAME visual style as thumbnail.prompt (glassmorphism, cyan/purple glowing palette, 16:9 widescreen, octane render, ABSOLUTELY NO TEXT, NO LETTERS, NO LABELS, NO ARROWS, NO WORDS — pure abstract visual metaphor only)",
       "alt_en": "Descriptive English alt text of the VISUAL MOOD only (not a diagram description)",
       "alt_bn": "ভিজ্যুয়াল মুড বর্ণনা করা বাংলা অল্ট টেক্সট (ডায়াগ্রাম বা ফ্লো নয়)",
       "caption_en": "Short atmospheric caption (NOT a figure label like 'Figure 1: ...')",
       "caption_bn": "সংক্ষিপ্ত অ্যাটমোসফেরিক ক্যাপশন (ফিগার লেবেল নয়)",
       "url": null
     }
   ]
   For ALL flow, architecture, sequence, pipeline, lifecycle, data-movement, or process diagrams: use \`\`\`mermaid blocks in the article body. Follow every \`\`\`mermaid with '*Architecture Flow Summary: ...*' for GEO crawlers.
18. "og_image_en": "https://zahidhasantonmoy.vercel.app/blog/" + slug + "/opengraph-image".
19. "og_image_bn": "https://zahidhasantonmoy.vercel.app/bn/blog/" + slug + "/opengraph-image".
20. "branding":
   - "angle": 1-sentence personal developer branding angle highlighting engineering excellence.
21. "series": If the topic is part of an ongoing multi-part tutorial or educational series (e.g. AI Agent Series Post 2 of 5), provide series metadata; if standalone, set fields to null:
   - "index": integer (e.g. 2 for Post 2)
   - "total": integer (e.g. 5)
   - "prev_post_slug": Slug of the previous post if index > 1 (e.g. "${resolvedPrevSlug || "mastering-autonomous-ai-agents"}"), else null
   - "prev_post_title_bn": EXACT title of the previous post in Bangla (${resolvedPrevTitle ? `"${resolvedPrevTitle}"` : "only if explicitly known"}). STRICT RULE: NEVER fabricate or guess a title! If not explicitly verified, set this field to null.

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
  "content_images": [
    {
      "id": "img-1",
      "placement_marker": "{{IMAGE:img-1}}",
      "prompt": "string",
      "alt_en": "string",
      "alt_bn": "string",
      "caption_en": "string",
      "caption_bn": "string",
      "url": null
    }
  ],
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
    "primary_keyword_en": "string",
    "secondary_keywords_en": ["string"],
    "primary_keyword_bn": "string",
    "secondary_keywords_bn": ["string"],
    "search_intent": "tutorial"
  },
  "social": {
    "linkedin_post_en": "string",
    "linkedin_hashtags_en": ["string"],
    "linkedin_post_bn": "string",
    "linkedin_hashtags_bn": ["string"],
    "devto_title": "string",
    "devto_article": "string",
    "devto_tags": ["string"]
  },
  "thumbnail": {
    "prompt": "string",
    "text": "string",
    "aspect_ratio": "16:9"
  },
  "og_image_en": "string",
  "og_image_bn": "string",
  "series": {
    "index": null,
    "total": null,
    "prev_post_title_bn": null,
    "prev_post_slug": null
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

    // Safeguard & guarantee all SEO/GEO attributes
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

    const ogEn = result.og_image_en || result.og_image || `https://zahidhasantonmoy.vercel.app/blog/${slug}/opengraph-image`;
    const ogBn = result.og_image_bn || `https://zahidhasantonmoy.vercel.app/bn/blog/${slug}/opengraph-image`;
    result.og_image_en = ogEn;
    result.og_image_bn = ogBn;
    delete (result as any).og_image;

    if (!result.seo) result.seo = {};
    const primaryEn = result.seo.primary_keyword_en || result.seo.primary_keyword || targetTopic;
    result.seo.primary_keyword_en = primaryEn;
    result.seo.primary_keyword_bn = result.seo.primary_keyword_bn || (result.bangla?.title || "ওয়েব ডেভেলপমেন্ট");
    if (!Array.isArray(result.seo.secondary_keywords_en)) {
      result.seo.secondary_keywords_en = result.seo.secondary_keywords || ["Next.js", "React", "AI Agent"];
    }
    if (!Array.isArray(result.seo.secondary_keywords_bn)) {
      result.seo.secondary_keywords_bn = ["নেক্সট জেএস টিউটোরিয়াল বাংলা", "ল্যাংচেইন দিয়ে এআই এজেন্ট", "স্বয়ংক্রিয় এআই এজেন্ট তৈরি"];
    }
    // Remove legacy un-suffixed duplicates from output to keep schema clean
    delete (result.seo as any).primary_keyword;
    delete (result.seo as any).secondary_keywords;

    // Normalize social fields for both English and Bangla LinkedIn posts
    if (!result.social) result.social = {};
    const linkedInEn = result.social.linkedin_post_en || result.social.linkedin_post || "";
    result.social.linkedin_post_en = linkedInEn;
    result.social.linkedin_post = linkedInEn; // backwards compatibility
    const hashEn = Array.isArray(result.social.linkedin_hashtags_en)
      ? result.social.linkedin_hashtags_en
      : Array.isArray(result.social.linkedin_hashtags)
      ? result.social.linkedin_hashtags
      : ["#WebDev", "#Nextjs", "#React"];
    result.social.linkedin_hashtags_en = hashEn;
    result.social.linkedin_hashtags = hashEn; // backwards compatibility

    if (!result.social.linkedin_post_bn) {
      result.social.linkedin_post_bn = `🚀 নতুন টেকনিক্যাল আর্টিকেল: ${result.bangla?.title || targetTopic}\n\n${result.excerpt?.bangla || ""}\n\n🔗 সম্পূর্ণ আর্টিকেলটি পড়ুন: https://zahidhasantonmoy.vercel.app/bn/blog/${slug}`;
    }
    if (!Array.isArray(result.social.linkedin_hashtags_bn)) {
      result.social.linkedin_hashtags_bn = ["#প্রোগ্রামিং", "#ওয়েবডেভেলপমেন্ট", "#নেক্সটজেএস", "#TechBangladesh"];
    }

    // Normalize series field safely
    if (result.series && typeof result.series === "object") {
      const seriesSlug = typeof result.series.prev_post_slug === "string" ? result.series.prev_post_slug : resolvedPrevSlug;
      let finalPrevTitle = resolvedPrevTitle;
      if (!finalPrevTitle && seriesSlug === "mastering-autonomous-ai-agents") {
        finalPrevTitle = "নেক্সট জেএস ও ল্যাংচেইন দিয়ে স্বয়ংক্রিয় এআই এজেন্ট ডেভেলপমেন্ট";
      }
      result.series = {
        index: typeof result.series.index === "number" ? result.series.index : null,
        total: typeof result.series.total === "number" ? result.series.total : null,
        prev_post_title_bn: finalPrevTitle || (result.series.index && result.series.index > 1 ? resolvedPrevTitle : null),
        prev_post_slug: seriesSlug || null,
      };
    } else {
      result.series = {
        index: null,
        total: null,
        prev_post_title_bn: null,
        prev_post_slug: null,
      };
    }

    // Standardize category taxonomy & search_intent enum
    if (result.category === "ai-agent-development") {
      result.category = "ai-agent-fundamentals";
    }
    const validIntents = ["informational", "tutorial", "comparison", "transactional"];
    if (result.seo) {
      if (!validIntents.includes(result.seo.search_intent)) {
        result.seo.search_intent = result.seo.search_intent === "guide" ? "tutorial" : "informational";
      }
    }

    // Ensure links are strictly populated
    result.links = {
      github: "https://github.com/zahidhasantonmoy",
      portfolio: "https://zahidhasantonmoy.vercel.app",
    };

    // Process and normalize content_images (cap at 2 max, strictly decorative)
    if (Array.isArray(result.content_images)) {
      result.content_images = result.content_images
        .slice(0, 2)
        .map((img: any, idx: number) => {
          const id = img.id || `img-${idx + 1}`;
          const marker = `{{IMAGE:${id}}}`;
          return {
            id,
            placement_marker: marker,
            prompt: typeof img.prompt === "string" ? img.prompt.trim() : "",
            alt_en: typeof img.alt_en === "string" ? img.alt_en.trim() : `Abstract visual concept for ${targetTopic}`,
            alt_bn: typeof img.alt_bn === "string" ? img.alt_bn.trim() : `${targetTopic}-এর বিমূর্ত কনসেপ্ট আর্ট`,
            caption_en: typeof img.caption_en === "string" ? img.caption_en.trim() : "",
            caption_bn: typeof img.caption_bn === "string" ? img.caption_bn.trim() : "",
            url: null,
            status: "pending",
          };
        });
    } else {
      result.content_images = [];
    }

    // Compute word count & reading time
    const enWords = result.english?.article ? result.english.article.trim().split(/\s+/).filter(Boolean).length : 0;
    const bnWords = result.bangla?.article ? result.bangla.article.trim().split(/\s+/).filter(Boolean).length : 0;
    result.word_count = {
      english: enWords,
      bangla: bnWords,
    };
    result.reading_time_minutes = Math.max(1, Math.ceil(enWords / 200));

    // Word count target validation status (target: 1,200 - 1,800 words)
    result.word_count_status = {
      target_min: 1200,
      target_max: 1800,
      english_meets_target: enWords >= 1200,
      bangla_meets_target: bnWords >= 1200,
      notice: enWords < 1200 || bnWords < 1200
        ? `Warning: Content word count is below the recommended 1,200-word target (EN: ${enWords}, BN: ${bnWords}).`
        : "Success: Content length meets the 1,200-1,800 word guideline."
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Post Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate post" },
      { status: 500 }
    );
  }
}
