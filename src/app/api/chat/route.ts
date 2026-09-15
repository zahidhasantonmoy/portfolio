import { NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import profileData from "@/data/data.json";

// Format projects and skills into an ultra-concise knowledge base for the system prompt
const skillsSummary = profileData.skills
  .map((s) => `${s.category}: ${s.items.join(", ")}`)
  .join("\n");

const projectsSummary = profileData.projects
  .map(
    (p) =>
      `• ${p.title} (${p.category}): Built with ${p.technologies.join(", ")}. Live: ${p.liveUrl || "N/A"}, GitHub: ${p.githubUrl || "N/A"}. Brief: ${p.description.slice(0, 180)}...`
  )
  .join("\n");

const SYSTEM_PROMPT = `
You are "Tonmoy AI", the personal AI assistant and portfolio representative of Zahid Hasan Tonmoy.
Your purpose is to answer questions from recruiters, hiring managers, engineering leaders, and potential clients professionally, concisely, and warmly.

ABOUT ZAHID HASAN TONMOY:
- Title: ${profileData.title}
- Location: Dhaka, Bangladesh
- Bio: ${profileData.aboutMe}
- Contact Email: Check the Contact section or email via portfolio form.
- Social Profiles:
  - GitHub: https://github.com/zahidhasantonmoy
  - LinkedIn: https://www.linkedin.com/in/zahid-hasan-tonmoy
  - Portfolio: https://zahidhasantonmoy.vercel.app

TECHNICAL SKILLS:
${skillsSummary}

FEATURED PROJECTS:
${projectsSummary}

INSTRUCTIONS FOR RESPONSES:
1. Always speak on behalf of Zahid with enthusiasm, humility, and engineering precision.
2. Keep responses structured, concise, and easy to read for busy recruiters (use bullet points, short paragraphs, bold text for technologies).
3. If asked about his availability, state that he is open to full-time remote opportunities, contract roles, and innovative AI/Full-stack freelance projects.
4. If asked how to reach or hire him, provide his LinkedIn link, GitHub, and encourage using the Contact Form on this site.
5. If someone asks in Bangla or English, respond fluently in the same language.
6. Do NOT make up qualifications not listed above. If you don't know something specific, kindly advise them to connect directly with Zahid via email or LinkedIn.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Messages array is required." },
        { status: 400 }
      );
    }

    const conversation = messages.slice(-10); // Keep last 10 messages for context

    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    let reply = "";

    // 1. Try Groq first for ultra-fast latency (<500ms)
    if (groqKey) {
      try {
        const groq = new OpenAI({
          baseURL: "https://api.groq.com/openai/v1",
          apiKey: groqKey,
        });

        const groqMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: "system", content: SYSTEM_PROMPT },
          ...conversation.map((m: any) => ({
            role: m.role as "user" | "assistant",
            content: String(m.content),
          })),
        ];

        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: groqMessages,
          max_tokens: 600,
          temperature: 0.7,
        });

        reply = completion.choices[0]?.message?.content || "";
      } catch (err: any) {
        console.warn("[ChatBot Groq Failed, falling back]:", err?.message);
      }
    }

    // 2. Try OpenRouter (Fallback)
    if (!reply && openRouterKey) {
      try {
        const openrouter = new OpenAI({
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: openRouterKey,
        });

        const orMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: "system", content: SYSTEM_PROMPT },
          ...conversation.map((m: any) => ({
            role: m.role as "user" | "assistant",
            content: String(m.content),
          })),
        ];

        const completion = await openrouter.chat.completions.create({
          model: "meta-llama/llama-3.3-70b-instruct",
          messages: orMessages,
          max_tokens: 600,
          temperature: 0.7,
        });

        reply = completion.choices[0]?.message?.content || "";
      } catch (err: any) {
        console.warn("[ChatBot OpenRouter Failed, falling back]:", err?.message);
      }
    }

    // 3. Try Gemini (Fallback)
    if (!reply && geminiKey) {
      const geminiModels = [
        "gemini-2.5-flash",
        "gemini-3.5-flash-lite",
        "gemini-1.5-flash",
      ];
      const ai = new GoogleGenAI({ apiKey: geminiKey });

      for (const model of geminiModels) {
        try {
          // Format prompt with history
          const lastUserMessage = conversation[conversation.length - 1]?.content || "";
          const historySummary = conversation
            .slice(0, -1)
            .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
            .join("\n");

          const fullPrompt = `${SYSTEM_PROMPT}\n\nCONVERSATION HISTORY:\n${historySummary}\n\nUSER: ${lastUserMessage}\nASSISTANT:`;

          const response = await ai.models.generateContent({
            model,
            contents: fullPrompt,
          });

          if (response.text) {
            reply = response.text;
            break;
          }
        } catch (err: any) {
          console.warn(`[ChatBot Gemini ${model} Failed]:`, err?.message);
        }
      }
    }

    if (!reply) {
      reply =
        "Hello! I am currently experiencing high network demand. Zahid Hasan Tonmoy is a MERN Full Stack & AI Agent Developer. You can check his projects in the Projects section or reach him directly via the Contact Form below or on [LinkedIn](https://www.linkedin.com/in/zahid-hasan-tonmoy).";
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("[ChatBot API Error]:", error);
    return NextResponse.json(
      {
        reply:
          "I apologize, but I am momentarily unavailable. Please explore the portfolio or connect with Zahid directly via the contact form or LinkedIn!",
      },
      { status: 500 }
    );
  }
}
