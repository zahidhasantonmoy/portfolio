import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
    const { title, content } = await request.json();

    if (!title && !content) {
      return NextResponse.json(
        { error: "Post title and content are required to generate SEO." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use gemini-1.5-flash (the standard model for general text tasks)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert SEO specialist and copywriter.
      I will provide you with the title and content of a blog post.
      Your task is to generate highly optimized SEO metadata for this post in BOTH English and Bengali.

      Requirements:
      - SEO Title (English): Max 60 characters. Catchy and keyword-rich.
      - Meta Description (English): Max 160 characters. Compelling, summarizing the post, with a call to action.
      - SEO Title (Bengali): Max 60 characters. Catchy and culturally appropriate translation/adaptation.
      - Meta Description (Bengali): Max 160 characters. Compelling and summarizes the post in Bengali.

      Input:
      Title: ${title}
      Content: ${content.substring(0, 3000)}... // Truncated for token limits

      You MUST respond ONLY with a valid JSON object in the following format, with no markdown formatting or backticks around it:
      {
        "seo_title_en": "Your English Title",
        "meta_desc_en": "Your English Meta Description",
        "seo_title_bn": "আপনার বাংলা টাইটেল",
        "meta_desc_bn": "আপনার বাংলা মেটা ডেসক্রিপশন"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up response if the model accidentally wraps it in markdown code blocks
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("SEO Generation Error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate SEO";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
