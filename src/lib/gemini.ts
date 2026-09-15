import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Delay execution for a given number of milliseconds
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * A robust wrapper for Gemini AI that includes exponential backoff retries and model fallback.
 * It primarily tries to use gemini-3.6-flash, and falls back to gemini-3.1-pro-preview.
 */
export async function generateContentWithRetry(
  prompt: string,
  systemInstruction?: string,
  responseMimeType: string = "application/json",
  maxRetries: number = 3
): Promise<string> {
  const models = ["gemini-3.6-flash", "gemini-3.1-pro-preview"];
  let attempt = 0;
  let delay = 1000; // start with 1 second delay

  for (let m = 0; m < models.length; m++) {
    const model = models[m];
    
    while (attempt < maxRetries) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType,
          },
        });
        
        return response.text || "";
      } catch (error: any) {
        // If it's a 503 (Unavailable) or 429 (Too Many Requests), we retry.
        const isRetryableError = error?.status === "UNAVAILABLE" || error?.status === 503 || error?.status === 429 || error?.message?.includes("503");
        
        if (isRetryableError && attempt < maxRetries - 1) {
          attempt++;
          console.log(`[Gemini API] ${model} unavailable (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`);
          await sleep(delay);
          delay *= 2; // Exponential backoff
          continue;
        }

        // If we exhausted retries on this model but there's a fallback model, break the while loop and try the next model.
        if (isRetryableError && m < models.length - 1) {
          console.warn(`[Gemini API] ${model} completely failed. Falling back to next model...`);
          break; 
        }

        // If it's a non-retryable error, or we exhausted all models and retries, throw it.
        if (m === models.length - 1) {
          console.error(`[Gemini API] All attempts and fallbacks failed. Error:`, error);
          throw error;
        }
        
        // If it wasn't a retryable error, but we have another model, let's just try the next model anyway just in case.
        break;
      }
    }
    // Reset attempt counter when switching models
    attempt = 0;
    delay = 1000;
  }
  
  throw new Error("Failed to generate content after all retries and fallbacks.");
}
