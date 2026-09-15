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
        "gemini-3.8-flash",      // Best quality, but lowest limit (20/day)
        "gemini-3.5-flash-lite", // Best bulk capacity (500/day)
        "gemini-3.1-flash-lite", // Backup bulk capacity (500/day)
        "gemini-3.6-flash"       // Extra fallback
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
        model: "llama3-8b-8192", // Super fast model
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
