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
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  let lastError: any = null;

  // 1. Try OpenRouter first (Fast, cheap, wide model selection)
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

      // Llama 3 or Haiku are good choices, we can use a fast model.
      const response = await openai.chat.completions.create({
        model: "meta-llama/llama-3.3-70b-instruct", // High quality open model
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

  // 2. Try Gemini (Fallback)
  if (geminiKey && (preferredProvider === 'auto' || preferredProvider === 'gemini')) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const models = [
        "gemini-2.0-flash-lite", // 30 RPM, 1,500/day
        "gemini-1.5-flash",      // 15 RPM, 1,500/day
        "gemini-2.0-flash",      // 15 RPM, 1,500/day
        "gemini-1.5-flash-8b",   // 15 RPM, 1,500/day
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

  // 3. Try Groq (Last Resort)
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
        model: "llama-3.1-8b-instant", // 14,400 Requests/Day
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

  throw new Error(
    "Quota exceeded on all providers or no valid API keys found. Please check your AI API limits."
  );
}
