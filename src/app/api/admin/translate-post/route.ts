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

  const hasAiKey = Boolean(
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.OPENROUTER_API_KEY ||
    process.env.GROQ_API_KEY
  );

  if (!hasAiKey) {
    return NextResponse.json(
      {
        error:
          "No AI API key found. Please configure GEMINI_API_KEY, OPENROUTER_API_KEY, or GROQ_API_KEY in your environment variables.",
      },
      { status: 500 }
    );
  }

  try {
    const { title_en, excerpt_en, content_en, provider } = await request.json();

    if (!title_en || !content_en) {
      return NextResponse.json(
        { error: "English Title and Content are required to translate." },
        { status: 400 }
      );
    }

    const cleanContent = content_en.trim();
    const cleanExcerpt = (excerpt_en || "").trim();

    const prompt = `
Translate the following English blog post into natural, grammatically correct, professional Bengali (আধুনিক চলিত ভাষা):

English Title:
${title_en}

${cleanExcerpt ? `English Excerpt:\n${cleanExcerpt}\n` : ""}
English Markdown Content:
${cleanContent.slice(0, 8000)}
`;

    const systemInstruction = `
You are an expert bilingual technical translator fluent in English and Bengali.
Your task is to precisely translate the provided English blog post Title, Excerpt, and Content into natural, grammatically correct Bengali.

Translation Guidelines:
1. Preserve all Markdown formatting, code blocks (do NOT translate code or variable names), links, and HTML structures exactly as they are.
2. Translate naturally and professionally in modern standard Bengali (আধুনিক চলিত বাংলা). Avoid stiff, robotic, or literal machine-translated phrasing.
3. Keep standard technical terms in English (e.g. "React", "Next.js", "Server Components", "API", "Database", "Tailwind CSS", "Hook", "State", "Props") or transliterate them appropriately without awkward translations.
4. If an Excerpt was not provided, generate a compelling 2-sentence summary in Bengali based on the content.

CRITICAL FORMATTING INSTRUCTION:
You must separate your output using EXACTLY these three section delimiters so the system can parse it cleanly without JSON formatting errors:

===TITLE_BN===
[Write the Bengali Title here]

===EXCERPT_BN===
[Write the Bengali Excerpt/Summary here]

===CONTENT_BN===
[Write the Full Bengali Markdown Content here]
`;

    const text = await generateContentWithFallback(
      prompt,
      systemInstruction,
      false, // Text mode with delimiters avoids JSON parsing & control character crashes
      provider && provider !== "auto" ? provider : "gemini"
    );

    if (!text || !text.trim()) {
      throw new Error("AI provider returned empty response. Please try again.");
    }

    let title_bn = "";
    let excerpt_bn = "";
    let content_bn = "";

    // 1. Primary: Delimiter-based extraction
    if (text.includes("===TITLE_BN===") || text.includes("===CONTENT_BN===")) {
      const titleMatch = text.match(/===TITLE_BN===([\s\S]*?)(?====EXCERPT_BN===|===CONTENT_BN===|$)/i);
      const excerptMatch = text.match(/===EXCERPT_BN===([\s\S]*?)(?====CONTENT_BN===|$)/i);
      const contentMatch = text.match(/===CONTENT_BN===([\s\S]*)/i);

      title_bn = titleMatch ? titleMatch[1].trim() : "";
      excerpt_bn = excerptMatch ? excerptMatch[1].trim() : "";
      content_bn = contentMatch ? contentMatch[1].trim() : "";
    }

    // 2. Fallback: Check if AI returned JSON
    if (!title_bn && !content_bn) {
      try {
        const cleaned = text
          .trim()
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/, "")
          .replace(/\s*```$/, "");
        const parsed = JSON.parse(cleaned);
        title_bn = parsed.title_bn || "";
        excerpt_bn = parsed.excerpt_bn || "";
        content_bn = parsed.content_bn || "";
      } catch {
        // 3. Fallback: Regex extraction on JSON-like or Markdown headers
        const tMatch = text.match(/"title_bn"\s*:\s*"([^"]+)"/i) || text.match(/^#\s+(.+)$/m);
        const eMatch = text.match(/"excerpt_bn"\s*:\s*"([^"]+)"/i);
        const cMatch = text.match(/"content_bn"\s*:\s*"([\s\S]+?)"\s*}/i);

        title_bn = tMatch ? tMatch[1].trim() : "";
        excerpt_bn = eMatch ? eMatch[1].trim() : "";
        content_bn = cMatch ? cMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').trim() : text.trim();
      }
    }

    // Sanitize any generic fallback messages in excerpt
    if (
      excerpt_bn.includes("কোনটি প্রদান করা হয়নি") ||
      excerpt_bn.includes("কিছুই প্রদান করা হয়নি") ||
      excerpt_bn.toLowerCase().includes("none provided")
    ) {
      excerpt_bn = "";
    }

    if (!title_bn && !content_bn) {
      throw new Error("Failed to extract translated text from AI response. Please try again.");
    }

    return NextResponse.json({
      title_bn: title_bn || title_en,
      excerpt_bn: excerpt_bn || "",
      content_bn: content_bn || cleanContent,
    });
  } catch (error: unknown) {
    console.error("Auto Translate Error:", error);
    const message = error instanceof Error ? error.message : "Failed to translate post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
