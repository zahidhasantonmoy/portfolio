import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

/** POST /api/subscribe — Newsletter subscription */
export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("subscribers")
      .select("id, status")
      .eq("email", email)
      .single();

    if (existing) {
      if (existing.status === "active") {
        return NextResponse.json({ message: "Already subscribed!" });
      }
      // Re-subscribe
      const { error } = await supabase
        .from("subscribers")
        .update({ status: "active", unsubscribed_at: null })
        .eq("id", existing.id);
      if (error) throw error;
      return NextResponse.json({ message: "Welcome back! You're subscribed again." });
    }

    // New subscriber
    const { error } = await supabase.from("subscribers").insert({
      email,
      name: name || null,
      status: "active",
      confirmed_at: new Date().toISOString(), // Double opt-in later
    });

    if (error) throw error;

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

    const supabase = await createClient();
    await supabase
      .from("subscribers")
      .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
      .eq("email", email);

    return NextResponse.json({ message: "Unsubscribed successfully." });
  } catch (err) {
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }
}
