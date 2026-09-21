import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateContentWithFallback(
  prompt: string,
  systemInstruction?: string,
  isJsonMode: boolean = true,
  preferredProvider: 'auto' | 'openrouter' | 'gemini' | 'groq' = 'auto'
): Promise<string> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  let lastError: any = null;

  // 1. Try Gemini first (Fastest response time ~1.5s, native multilingual Bengali support)
  if (geminiKey && (preferredProvider === 'auto' || preferredProvider === 'gemini')) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const models = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-1.5-flash",
      ];
      
      for (const model of models) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: isJsonMode ? "application/json" : "text/plain",
            },
          });
          if (response.text) {
            return response.text;
          }
        } catch (err: any) {
          console.warn(`[Gemini ${model}] Failed:`, err?.message);
          lastError = err;
        }
      }
    } catch (err: any) {
      console.warn("[Gemini Core] Failed:", err?.message);
      lastError = err;
    }
  }

  if (preferredProvider === 'gemini') throw new Error('Gemini failed: ' + (lastError?.message || 'Unknown error'));

  // 2. Try Groq (Ultra-fast inference ~1s)
  if (groqKey && (preferredProvider === 'auto' || preferredProvider === 'groq')) {
    try {
      const groq = new OpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: groqKey,
      });

      const messages: any[] = [];
      if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
      }
      messages.push({ role: "user", content: prompt });

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        response_format: isJsonMode ? { type: "json_object" } : undefined,
      });

      if (response.choices[0]?.message?.content) {
        return response.choices[0].message.content;
      }
    } catch (err: any) {
      console.warn("[Groq] Failed or Rate Limited:", err?.message);
      lastError = err;
    }
  }

  if (preferredProvider === 'groq') throw new Error('Groq failed: ' + (lastError?.message || 'Unknown error'));

  // 3. Try OpenRouter (Fallback)
  if (openRouterKey && (preferredProvider === 'auto' || preferredProvider === 'openrouter')) {
    try {
      const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: openRouterKey,
      });

      const messages: any[] = [];
      if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
      }
      messages.push({ role: "user", content: prompt });

      const response = await openai.chat.completions.create({
        model: "meta-llama/llama-3.3-70b-instruct",
        messages,
        response_format: isJsonMode ? { type: "json_object" } : undefined,
      });

      if (response.choices[0]?.message?.content) {
        return response.choices[0].message.content;
      }
    } catch (err: any) {
      console.warn("[OpenRouter] Failed or Rate Limited:", err?.message);
      lastError = err;
    }
  }

  if (preferredProvider === 'openrouter') throw new Error('OpenRouter failed: ' + (lastError?.message || 'Unknown error'));

  throw new Error(
    "Quota exceeded on all providers or no valid API keys found. Please check your AI API limits."
  );
}
