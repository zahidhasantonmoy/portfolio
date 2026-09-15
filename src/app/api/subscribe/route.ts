import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

/** POST /api/subscribe — Newsletter subscription */
export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Check if already subscribed
    const rows = await sql`SELECT id, status FROM subscribers WHERE email = ${email} LIMIT 1`;
    const existing = rows.length > 0 ? rows[0] : null;

    if (existing) {
      if (existing.status === "active") {
        return NextResponse.json({ message: "Already subscribed!" });
      }
      // Re-subscribe
      await sql`
        UPDATE subscribers
        SET status = 'active', unsubscribed_at = NULL
        WHERE id = ${existing.id}
      `;
      return NextResponse.json({ message: "Welcome back! You're subscribed again." });
    }

    // New subscriber
    await sql`
      INSERT INTO subscribers (email, name, status, confirmed_at)
      VALUES (${email}, ${name || null}, 'active', NOW())
    `;

    return NextResponse.json(
      { message: "Successfully subscribed! Thank you." },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/subscribe]", err);
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}

/** DELETE /api/subscribe — Unsubscribe */
export async function DELETE(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    await sql`
      UPDATE subscribers
      SET status = 'unsubscribed', unsubscribed_at = NOW()
      WHERE email = ${email}
    `;

    return NextResponse.json({ message: "Unsubscribed successfully." });
  } catch (err) {
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }
}
