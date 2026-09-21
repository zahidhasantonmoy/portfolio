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
    const { title, excerpt, content, category, tags, style, provider } = await request.json();

    if (!title && !content && !excerpt) {
      return NextResponse.json(
        { error: "Post title, excerpt, or content is required to generate a prompt." },
        { status: 400 }
      );
    }

    const cleanTitle = (title || "").trim();
    const cleanExcerpt = (excerpt || "").trim();
    const cleanContent = (content || "").trim();
    const cleanCategory = (category || "").trim();
    const tagsList = Array.isArray(tags) ? tags.join(", ") : (tags || "");
    const selectedStyle = style && style !== "auto" ? style : "contextual-adaptive";

    const promptInput = `
ARTICLE DETAILS TO VISUALIZE:
- Title: ${cleanTitle || "Technical Blog Article"}
${cleanCategory ? `- Category / Domain: ${cleanCategory}` : ""}
${tagsList ? `- Relevant Tags / Tech Stack: ${tagsList}` : ""}
${cleanExcerpt ? `- Post Summary / Excerpt: ${cleanExcerpt}` : ""}
- Key Article Excerpt (first 2,000 characters):
${cleanContent.slice(0, 2000)}

REQUESTED ARTISTIC STYLE / THEME: ${selectedStyle}
`;

    const systemInstruction = `You are a world-class Art Director and Senior AI Prompt Engineer specializing in high-end tech blog thumbnails, cover artwork, and OpenGraph hero images (for Midjourney v6, Flux, and DALL-E 3).

YOUR MISSION:
Analyze the provided blog post's title, category, tech stack, and content. Generate a custom, laser-focused, stunning visual image generation prompt that captures the EXACT technical essence and visual metaphor of THIS SPECIFIC post.

CRITICAL RULES:
1. FOCUS STRICTLY ON THE ARTICLE'S UNIQUE TOPIC (NO RANDOM OR GENERIC PROMPTS):
   - Never generate generic, repetitive "neon workspace with a laptop" prompts unless the article is specifically about desk ergonomics.
   - For Frontend / React / Next.js / UI-UX: Floating modular holographic UI components, sleek translucent glass panels, responsive device frames, sleek web interface architecture.
   - For Backend / API / Microservices / Node: High-speed glowing data streams, interconnected microservice nodes, illuminated fiber-optic highways, server rack architecture.
   - For Databases / SQL / PostgreSQL / Redis: Multi-layered glowing holographic data cubes, relational schematics, crystalline memory storage grids, luminous query pipelines.
   - For DevOps / Docker / Kubernetes / Cloud: Isometric container shipping pods floating in a digital cloud nexus, orbital cluster orchestration, planetary network topology.
   - For Cybersecurity / Cryptography / Auth: Digital security fortress, cryptographic cipher matrices, glowing quantum padlock, holographic shield defending against data breaches, dark stealth aesthetic.
   - For AI / Machine Learning / Deep Learning: Glowing neural synaptic lattices, multidimensional vector embedding space, cognitive AI core, radiant knowledge graphs.
   - For IoT / Hardware / Embedded / Sensors: Macro shot of a sleek motherboard, glowing copper traces, glowing microcontroller silicon chip, real-time sensor telemetry.
   - For Mobile / Flutter / Cross-Platform: Floating sleek glass smartphones with holographic UI layers, dual-platform symmetry, modern mobile ecosystem.
   - For Python / Data Science / Analytics: Luminous 3D statistical data visualizations, flowing telemetry charts, dimensional data clusters.
   - For Laravel / PHP / Full-Stack: Elegant architectural blueprints, clean structured framework pillars, server-side data flow.

2. ASPECT RATIO & COMPOSITION (16:9 WIDESCREEN BANNER):
   - Optimized for 16:9 widescreen blog cover / thumbnail banner (1280x720).
   - Clear, distinct central or rule-of-thirds focal subject.
   - Balanced negative space on one side for visual breathing room.
   - Cinematic volumetric lighting, atmospheric ambient glow, Octane render quality, 8k resolution.

3. STRICT PROHIBITION:
   - ABSOLUTELY NO TEXT, NO LETTERS, NO WORDS, NO NUMBERS, NO WATERMARKS, NO LABELS, NO TYPOGRAPHY INSIDE THE IMAGE. Pure visual storytelling only.

OUTPUT FORMAT:
Respond with ONLY a valid JSON object matching this exact schema:
{
  "prompt": "Detailed 40-55 word prompt containing the exact visual subject, environment, lighting, color palette, 16:9 aspect ratio, cinematic lighting, 8k render, no text, no words",
  "theme": "Identified Theme (e.g., Cloud & Docker Container Orchestration)",
  "color_palette": "Dominant Color Scheme (e.g., Deep Navy Blue & Electric Cyan)",
  "concept": "1-sentence explanation of why this visual represents this article"
}`;

    const text = await generateContentWithFallback(
      promptInput,
      systemInstruction,
      true,
      provider || "auto"
    );

    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Fallback regex extraction if model wraps in code fences
      const match = text.match(/\{[\s\S]*"prompt"[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          // ignore
        }
      }
    }

    if (!parsed || !parsed.prompt) {
      // Clean string fallback
      const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        parsed = {
          prompt: `High-tech visual representation of ${cleanTitle || "software engineering"}, 16:9 widescreen banner, cinematic lighting, vibrant digital art, octane render, 8k, no text, no words`,
          theme: cleanCategory || "Modern Technology",
          color_palette: "Dark Slate & Vivid Accent Glow",
          concept: `Custom visual artwork representing ${cleanTitle}`,
        };
      }
    }

    return NextResponse.json({
      success: true,
      prompt: parsed.prompt,
      theme: parsed.theme || cleanCategory || "Modern Technology",
      color_palette: parsed.color_palette || "Deep Tech Dark & Neon Glow",
      concept: parsed.concept || `Visual metaphor tailored to ${cleanTitle}`,
    });
  } catch (error: unknown) {
    console.error("[generate-image-prompt] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate prompt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
