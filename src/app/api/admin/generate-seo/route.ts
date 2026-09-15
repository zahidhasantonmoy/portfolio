import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateContentWithFallback } from "@/lib/ai";

export const maxDuration = 60; // Allow up to 60 seconds for Vercel Hobby

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured in the server environment." },
      { status: 500 }
    );
  }

  try {
    const { title, content, provider } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Post title and content are required to generate SEO." },
        { status: 400 }
      );
    }

    const prompt = `
      Input:
      Title: ${title}
      Content: ${content.substring(0, 3000)}... // Truncated for token limits
    `;
    
    const systemInstruction = `
      You are an expert SEO specialist and copywriter.
      I will provide you with the title and content of a blog post.
      Your task is to generate highly optimized SEO metadata for this post in BOTH English and Bengali.

      Requirements:
      - SEO Title (English): Max 60 characters. Catchy and keyword-rich.
      - Meta Description (English): Max 160 characters. Compelling, summarizing the post, with a call to action.
      - SEO Title (Bengali): Max 60 characters. Catchy and culturally appropriate translation/adaptation.
      - Meta Description (Bengali): Max 160 characters. Compelling and summarizes the post in Bengali.

      You MUST respond ONLY with a valid JSON object in the following format, with no markdown formatting or backticks around it:
      {
        "seo_title_en": "Your English Title",
        "meta_desc_en": "Your English Meta Description",
        "seo_title_bn": "আপনার বাংলা টাইটেল",
        "meta_desc_bn": "আপনার বাংলা মেটা ডেসক্রিপশন"
      }
    `;

    // Using our new retry & fallback utility, requesting JSON response format
    const text = await generateContentWithFallback(
      prompt,
      systemInstruction,
      true,
      provider || "auto"
    );
    
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON. Raw response text was:");
      console.error(text);
      throw new Error("Gemini returned invalid JSON format.");
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("SEO Generation Error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate SEO";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
