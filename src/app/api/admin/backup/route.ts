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
    const [
      posts,
      devLogs,
      projects,
      skills,
      subscribers,
      messages,
      categories,
      tags,
    ] = await Promise.all([
      sql`SELECT * FROM posts ORDER BY created_at DESC`.catch(() => []),
      sql`SELECT * FROM dev_logs ORDER BY log_date DESC`.catch(() => []),
      sql`SELECT * FROM projects ORDER BY created_at DESC`.catch(() => []),
      sql`SELECT * FROM skills ORDER BY created_at DESC`.catch(() => []),
      sql`SELECT * FROM subscribers ORDER BY created_at DESC`.catch(() => []),
      sql`SELECT * FROM contact_messages ORDER BY created_at DESC`.catch(() => []),
      sql`SELECT * FROM categories ORDER BY created_at DESC`.catch(() => []),
      sql`SELECT * FROM tags ORDER BY id ASC`.catch(() => []),
    ]);

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];

    const backupPayload = {
      backup_version: "1.0",
      author: "Zahid Hasan Tonmoy",
      domain: "https://zahidhasantonmoy.vercel.app",
      exported_at: now.toISOString(),
      stats: {
        total_posts: posts.length,
        total_dev_logs: devLogs.length,
        total_projects: projects.length,
        total_skills: skills.length,
        total_subscribers: subscribers.length,
        total_messages: messages.length,
        total_categories: categories.length,
        total_tags: tags.length,
      },
      data: {
        posts,
        dev_logs: devLogs,
        projects,
        skills,
        subscribers,
        contact_messages: messages,
        categories,
        tags,
      },
    };

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
