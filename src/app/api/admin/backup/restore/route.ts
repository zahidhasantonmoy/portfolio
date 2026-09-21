import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { restoreBackupPayload } from "@/lib/backup";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    let { payload, cloudinary_url, strategy = "skip_existing" } = body;

    if (strategy !== "skip_existing" && strategy !== "overwrite") {
      strategy = "skip_existing";
    }

    // If a cloudinary_url was provided instead of direct payload
    if (!payload && cloudinary_url) {
      const fetchRes = await fetch(cloudinary_url, { cache: "no-store" });
      if (!fetchRes.ok) {
        return NextResponse.json(
          { error: `Failed to download backup from Cloudinary: ${fetchRes.statusText}` },
          { status: 400 }
        );
      }
      payload = await fetchRes.json();
    }

    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { error: "Invalid backup payload provided. Must be a valid JSON object." },
        { status: 400 }
      );
    }

    const summary = await restoreBackupPayload(payload, strategy);

    return NextResponse.json({
      success: true,
      message: `Database restore completed using '${strategy}' strategy.`,
      summary,
    });
  } catch (error: unknown) {
    console.error("[Database Restore API] Error:", error);
    const message = error instanceof Error ? error.message : "Restore process encountered an error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
