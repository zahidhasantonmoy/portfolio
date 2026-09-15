import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateContentWithRetry } from "@/lib/gemini";

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
    const { content_en } = await request.json();

    if (!content_en) {
      return NextResponse.json(
        { error: "English Content is required to generate metadata." },
        { status: 400 }
      );
    }

    const prompt = `
      Input Content (English): 
      ${content_en.substring(0, 10000)} // Truncated to avoid huge token costs.
    `;
    
    const systemInstruction = `
      You are an expert content strategist and SEO specialist.
      I will provide you with the markdown content of a blog post.
      Your task is to generate a compelling excerpt (summary) in English, translate that excerpt to Bengali, and suggest 5 to 7 relevant tags.
      
      Requirements:
      - Excerpt (English): Max 300 characters. Engaging, summarizing the post, designed to make readers want to click.
      - Excerpt (Bengali): Max 300 characters. Accurate and engaging translation of the English excerpt.
      - Tags: An array of 5 to 7 highly relevant, single-word or short-phrase tags in English (e.g., ["React", "Web Development", "Tutorial"]).

      You MUST respond ONLY with a valid JSON object in the following format, with no markdown formatting or backticks around it:
      {
        "excerpt_en": "Your English Excerpt",
        "excerpt_bn": "আপনার বাংলা সারসংক্ষেপ",
        "tags": ["Tag1", "Tag2", "Tag3"]
      }
    `;

    const text = await generateContentWithRetry(prompt, systemInstruction, "application/json", 3);
    
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse Gemini meta response as JSON.");
      throw new Error("Gemini returned invalid JSON format.");
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("Generate Meta Error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate metadata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
