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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured in the server environment." },
      { status: 500 }
    );
  }

  try {
    const { title_en, excerpt_en, content_en } = await request.json();

    if (!title_en || !content_en) {
      return NextResponse.json(
        { error: "English Title and Content are required to translate." },
        { status: 400 }
      );
    }

    const prompt = `
      Input:
      Title (English): ${title_en}
      Excerpt (English): ${excerpt_en || "None provided"}
      Content (English): 
      ${content_en.substring(0, 10000)} // Truncated to avoid huge token costs, but enough for most posts.
    `;
    
    const systemInstruction = `
      You are an expert bilingual technical translator fluent in English and Bengali.
      Your task is to precisely translate the provided English blog post Title, Excerpt, and Content into natural, grammatically correct Bengali.
      
      Requirements:
      - Preserve all Markdown formatting, code blocks, links, and HTML structures exactly as they are in the content.
      - Translate the text naturally. Avoid robotic translations. Use standard professional Bengali (Sadhu/Cholit mix is okay, but lean towards modern Cholit).
      - If technical terms like "React", "Server Components", "API" are used, keep them in English script or transliterate them appropriately, but do not translate them awkwardly.

      You MUST respond ONLY with a valid JSON object in the following format, with no markdown formatting or backticks around it:
      {
        "title_bn": "translated title here",
        "excerpt_bn": "translated excerpt here",
        "content_bn": "translated markdown content here"
      }
    `;

    const text = await generateContentWithFallback(prompt, systemInstruction, true);
    
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse Gemini translation response as JSON.");
      throw new Error("Gemini returned invalid JSON format.");
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("Auto Translate Error:", error);
    const message = error instanceof Error ? error.message : "Failed to translate post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
