import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";
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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured." },
      { status: 500 }
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const { prompt, postDetails, modelName } = await request.json();

    let finalPrompt = prompt;

    // If no explicit prompt is provided, use the post details to auto-generate a good prompt
    if (!finalPrompt || finalPrompt.trim() === "") {
      if (!postDetails || postDetails.trim() === "") {
        return NextResponse.json(
          { error: "Either a Prompt or Post Details must be provided to generate an image." },
          { status: 400 }
        );
      }

      // Use text model to generate a descriptive image prompt
      const textResponse = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `You are an expert prompt engineer for AI image generation. 
        Create a concise, highly descriptive, and visual prompt (max 50 words) to generate a thumbnail image for the following blog post or newsletter.
        Make it suitable for a developer or tech blog. Do not include any text in the image.
        
        Content: ${postDetails.substring(0, 2000)}`,
      });

      finalPrompt = textResponse.text || "A modern software development workspace, abstract tech background, high quality, digital art.";
    }

    // Call Imagen 3 via Gemini API
    const imageResponse = await ai.models.generateImages({
      model: "imagen-3.0-generate-001",
      prompt: finalPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: "16:9",
      },
    });

    const base64Image = imageResponse.generatedImages?.[0]?.image?.imageBytes;
    if (!base64Image) {
      throw new Error("Failed to generate image from AI.");
    }

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
