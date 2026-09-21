import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateBackupPayload } from "@/lib/backup";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const backupPayload = await generateBackupPayload();
    const dateStr = new Date().toISOString().split("T")[0];
    const jsonString = JSON.stringify(backupPayload, null, 2);

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="zahid_portfolio_backup_${dateStr}.json"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: unknown) {
    console.error("[Database Backup] Error:", error);
    const message = error instanceof Error ? error.message : "Backup export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

