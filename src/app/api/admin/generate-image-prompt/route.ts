import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateContentWithFallback } from "@/lib/ai";

export const maxDuration = 45;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, content, provider } = await request.json();

    if (!title && !content) {
      return NextResponse.json(
        { error: "Post title or content is required to generate a prompt." },
        { status: 400 }
      );
    }

    const promptInput = `Title: ${title || "Untitled"}\n\nContent excerpt: ${(content || "").substring(0, 1500)}`;

    const systemInstruction = `You are a world-class prompt engineer for AI image generators (Midjourney v6, DALL-E 3, Flux, and Pollinations.ai).
Write a single, highly visual, stunning, and descriptive prompt (max 45 words) to create a futuristic cover thumbnail for a tech blog post.
Guidelines:
- Modern developer aesthetic: sleek 3D glassmorphic objects, glowing cybernetic neon accents, subtle isometric tech setup, or abstract code visualizations.
- Dramatic cinematic lighting, smooth depth of field, high dynamic range, digital art style.
- Absolutely NO text, NO words, NO letters, NO logos, and NO typography inside the image.

Output ONLY valid JSON with this exact structure:
{"prompt": "A futuristic 3D glassmorphism workspace..."}`;

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
      // Fallback regex extraction if model wraps in code fences
      const match = text.match(/\{[\s\S]*"prompt"[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        parsed = { prompt: text.replace(/[{}"]/g, "").trim() };
      }
    }

    return NextResponse.json({
      success: true,
      prompt: parsed.prompt || "Modern futuristic 3D software developer workspace, glowing neon circuitry, isometric view, cinematic lighting, vibrant digital art, no text",
    });
  } catch (error: unknown) {
    console.error("[generate-image-prompt] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate prompt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
