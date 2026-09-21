import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

async function callGemini(
  prompt: string,
  systemInstruction?: string,
  isJsonMode: boolean = false,
  apiKey?: string
): Promise<string> {
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

  let lastErr: any = null;

  // 1. Try GoogleGenAI SDK with modern models
  try {
    const ai = new GoogleGenAI({ apiKey });
    for (const model of GEMINI_MODELS) {
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
        console.warn(`[Gemini SDK ${model}] Failed:`, err?.message);
        lastErr = err;
      }
    }
  } catch (err: any) {
    console.warn("[Gemini SDK Init] Failed:", err?.message);
    lastErr = err;
  }

  // 2. Direct REST fallback across v1beta and v1 endpoints
  for (const model of ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"]) {
    for (const apiVer of ["v1beta", "v1"]) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12000);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/${apiVer}/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              systemInstruction: systemInstruction
                ? { parts: [{ text: systemInstruction }] }
                : undefined,
              generationConfig: {
                responseMimeType: isJsonMode ? "application/json" : "text/plain",
              },
            }),
          }
        );
        clearTimeout(timer);

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        } else {
          const errorData = await res.json().catch(() => null);
          if (errorData?.error?.message) {
            lastErr = new Error(errorData.error.message);
          }
        }
      } catch (err: any) {
        console.warn(`[Gemini REST ${apiVer}/${model}] Failed:`, err?.message);
        lastErr = err;
      }
    }
  }

  throw lastErr || new Error("Gemini generation failed on all models and endpoints.");
}

async function callGroq(
  prompt: string,
  systemInstruction?: string,
  isJsonMode: boolean = false,
  apiKey?: string
): Promise<string> {
  if (!apiKey) throw new Error("GROQ_API_KEY is missing");

  const groq = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey,
  });

  const messages: any[] = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  const groqModels = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
  let lastErr: any = null;

  for (const model of groqModels) {
    try {
      const response = await groq.chat.completions.create({
        model,
        messages,
        response_format: isJsonMode ? { type: "json_object" } : undefined,
      });

      if (response.choices[0]?.message?.content) {
        return response.choices[0].message.content;
      }
    } catch (err: any) {
      console.warn(`[Groq ${model}] Failed:`, err?.message);
      lastErr = err;
    }
  }

  throw lastErr || new Error("Groq generation failed.");
}

async function callOpenRouter(
  prompt: string,
  systemInstruction?: string,
  isJsonMode: boolean = false,
  apiKey?: string
): Promise<string> {
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is missing");

  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });

  const messages: any[] = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  const openRouterModels = [
    "meta-llama/llama-3.3-70b-instruct",
    "mistralai/mistral-large-2411",
    "google/gemini-2.0-flash-001",
  ];
  let lastErr: any = null;

  for (const model of openRouterModels) {
    try {
      const response = await openai.chat.completions.create({
        model,
        messages,
        response_format: isJsonMode ? { type: "json_object" } : undefined,
      });

      if (response.choices[0]?.message?.content) {
        return response.choices[0].message.content;
      }
    } catch (err: any) {
      console.warn(`[OpenRouter ${model}] Failed:`, err?.message);
      lastErr = err;
    }
  }

  throw lastErr || new Error("OpenRouter generation failed.");
}

export async function generateContentWithFallback(
  prompt: string,
  systemInstruction?: string,
  isJsonMode: boolean = true,
  preferredProvider: 'auto' | 'openrouter' | 'gemini' | 'groq' = 'auto'
): Promise<string> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  // Build provider execution list based on user preference
  let providerOrder: ('gemini' | 'groq' | 'openrouter')[] = [];

  if (preferredProvider === 'groq') {
    providerOrder = ['groq', 'gemini', 'openrouter'];
  } else if (preferredProvider === 'openrouter') {
    providerOrder = ['openrouter', 'groq', 'gemini'];
  } else {
    // 'auto' or 'gemini' (Gemini first, fallback to Groq, then OpenRouter)
    providerOrder = ['gemini', 'groq', 'openrouter'];
  }

  // Filter only providers with available API keys
  const availableProviders = providerOrder.filter((p) => {
    if (p === 'gemini') return Boolean(geminiKey);
    if (p === 'groq') return Boolean(groqKey);
    if (p === 'openrouter') return Boolean(openRouterKey);
    return false;
  });

  if (availableProviders.length === 0) {
    throw new Error(
      "No AI API keys configured. Please configure GEMINI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY in your environment variables."
    );
  }

  const errors: string[] = [];

  for (const provider of availableProviders) {
    try {
      if (provider === 'gemini') {
        return await callGemini(prompt, systemInstruction, isJsonMode, geminiKey);
      }
      if (provider === 'groq') {
        return await callGroq(prompt, systemInstruction, isJsonMode, groqKey);
      }
      if (provider === 'openrouter') {
        return await callOpenRouter(prompt, systemInstruction, isJsonMode, openRouterKey);
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.warn(`[AI Fallback] Provider '${provider}' failed:`, msg);
      errors.push(`${provider}: ${msg}`);
    }
  }

  throw new Error(`All available AI providers failed: ${errors.join(" | ")}`);
}
