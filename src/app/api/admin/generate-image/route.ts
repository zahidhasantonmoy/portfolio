import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateContentWithFallback } from "@/lib/ai";
import { v2 as cloudinary } from "cloudinary";

export const maxDuration = 60; // 60 seconds for image generation & upload

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { prompt, postDetails, title, category, tags, style, provider } = await request.json();

    let finalPrompt = (prompt || "").trim();

    // If no explicit prompt is provided, use the post details to auto-generate a tailored prompt
    if (!finalPrompt) {
      if (!postDetails && !title) {
        return NextResponse.json(
          { error: "Either a Prompt or Post Details must be provided to generate an image." },
          { status: 400 }
        );
      }

      const promptInput = `
POST DETAILS TO VISUALIZE:
- Title: ${title || "Technical Blog Article"}
${category ? `- Category: ${category}` : ""}
${tags ? `- Tags / Tech Stack: ${Array.isArray(tags) ? tags.join(", ") : tags}` : ""}
- Post Excerpt & Content:
${(postDetails || "").substring(0, 2000)}

REQUESTED ART STYLE: ${style && style !== "auto" ? style : "contextual-adaptive"}
`;

      const systemInstruction = `You are a world-class Art Director and AI Image Prompt Engineer.
Analyze the provided blog post topic and generate a single, highly visual, stunning prompt (40-50 words) for a 16:9 widescreen blog cover thumbnail (Flux / Midjourney).
Rules:
- Capture the EXACT technical domain (e.g. cloud infrastructure, holographic UI, database schemas, cryptographic cyber defense, neural network lattices, hardware PCB). Never generate generic workspace/laptop scenes.
- 16:9 widescreen composition (1280x720), cinematic volumetric lighting, 8k render, octane render.
- ABSOLUTELY NO TEXT, NO LETTERS, NO WORDS, NO WATERMARKS. Pure visual storytelling only.
Output ONLY the raw visual prompt string with no quotes or formatting.`;

      try {
        finalPrompt = await generateContentWithFallback(
          promptInput,
          systemInstruction,
          false,
          provider || "auto"
        );
        finalPrompt = finalPrompt.replace(/^["']|["']$/g, "").trim();
      } catch (err: any) {
        console.warn("Fallback prompt generation failed:", err?.message);
        finalPrompt = `Futuristic high-tech visual metaphor of ${title || "modern software engineering"}, 16:9 widescreen cover banner, glowing cinematic volumetric lighting, 8k resolution, octane render, digital art, no text`;
      }
    }

    // Call Pollinations.ai for image generation (1280x720 16:9 ratio with Flux model, no logo)
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      finalPrompt
    )}?width=1280&height=720&nologo=true&model=flux&seed=${Date.now()}`;
    
    const imageRes = await fetch(pollinationsUrl);
    if (!imageRes.ok) {
      throw new Error("Failed to generate image from AI.");
    }
    
    // If Cloudinary keys are not configured, just return the raw Pollinations URL
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET || !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      return NextResponse.json({
        url: pollinationsUrl,
        promptUsed: finalPrompt,
      });
    }

    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    // Upload to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        `data:image/jpeg;base64,${base64Image}`,
        {
          folder: "portfolio/ai-thumbnails",
          upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "portfolio_preset",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    return NextResponse.json({
      url: (uploadResponse as any).secure_url,
      promptUsed: finalPrompt,
    });
  } catch (error: any) {
    console.error("Generate Image Error:", error);
    const message = error?.message || "Failed to generate image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
