import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy",
});

export const maxDuration = 60; // 60s for generating long content

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const { topic } = await req.json();
    const targetTopic = topic?.trim() || "A random interesting topic about modern web development, React, or AI";

    const prompt = `
You are Zahid Hasan Tonmoy, a MERN Full Stack Developer and AI Agent Developer based in Dhaka, Bangladesh.
You are writing a highly engaging, human-like, SEO-optimized blog post for your personal portfolio website.
Your writing style is professional yet conversational, sharing practical insights and personal experience.
Write a comprehensive blog post about: "${targetTopic}"

Provide the response in JSON format with the following structure:
{
  "title_en": "A catchy, SEO-optimized English title (max 60 chars)",
  "excerpt_en": "A brief, engaging summary of the post (max 160 chars)",
  "content_en": "The full blog post content formatted in Markdown. Include headings, lists, code snippets if relevant, and bold text. Make it at least 500 words.",
  "seo_title_en": "An SEO-optimized title for search engines (max 60 chars)",
  "meta_desc_en": "A compelling meta description for search results (max 160 chars)"
}
    `;

    const modelsToTry = ["gemini-3.6-flash", "gemini-2.5-flash"];
    let responseText = "";

    for (let i = 0; i < modelsToTry.length; i++) {
      try {
        const response = await ai.models.generateContent({
          model: modelsToTry[i],
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title_en: { type: Type.STRING },
                excerpt_en: { type: Type.STRING },
                content_en: { type: Type.STRING },
                seo_title_en: { type: Type.STRING },
                meta_desc_en: { type: Type.STRING },
              },
              required: ["title_en", "excerpt_en", "content_en", "seo_title_en", "meta_desc_en"],
            },
            temperature: 0.7,
          },
        });

        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelsToTry[i]} failed:`, err.message);
        if (i === modelsToTry.length - 1) {
          throw err;
        }
      }
    }

    if (!responseText) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(responseText);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Post Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate post" },
      { status: 500 }
    );
  }
}
