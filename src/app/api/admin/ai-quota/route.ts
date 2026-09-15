import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const maxDuration = 10;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  const quotas = [
    {
      provider: "OpenRouter",
      isConfigured: !!openRouterKey,
      limitInfo: "Free tier models depend on credits. Typical free limits apply.",
      usageInfo: "Unknown",
    },
    {
      provider: "Gemini",
      isConfigured: !!geminiKey,
      limitInfo: "1,500 Requests / Day (Flash)",
      usageInfo: "Tracked internally by Google",
    },
    {
      provider: "Groq",
      isConfigured: !!groqKey,
      limitInfo: "14,400 Requests / Day (Llama 3 8B)",
      usageInfo: "Tracked internally by Groq",
    },
  ];

  // If OpenRouter is configured, try to fetch the exact credit/limit
  if (openRouterKey) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const limit = data.data?.limit;
        const usage = data.data?.usage;
        
        if (limit !== undefined && limit !== null) {
          quotas[0].limitInfo = `$${limit.toFixed(4)} Total Limit`;
          quotas[0].usageInfo = `$${(usage || 0).toFixed(4)} Used`;
        } else {
          quotas[0].limitInfo = "Unlimited or Pay-as-you-go";
          quotas[0].usageInfo = `$${(usage || 0).toFixed(4)} Used`;
        }
      }
    } catch (err) {
      console.error("Failed to fetch OpenRouter limits:", err);
    }
  }

  return NextResponse.json({ quotas });
}
