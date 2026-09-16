import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const unreadRes = await sql`
      SELECT count(*) as count FROM contact_messages WHERE status = 'unread'
    `.catch(() => [{ count: 0 }]);

    const unreadCount = Number(unreadRes[0]?.count ?? 0);

    return NextResponse.json({
      unreadMessages: unreadCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch notifications" }, { status: 500 });
  }
}
