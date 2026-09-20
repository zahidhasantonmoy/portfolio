import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { sendTelegramAlert } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }

    await sql`
      INSERT INTO contact_messages (name, email, message)
      VALUES (${name}, ${email}, ${message})
    `;

    // Detect if this is a resume/hire lead from ResumeLeadDrawer
    const isResumeLead = message.startsWith("[REQUEST RESUME");
    // Await alert so serverless runtime doesn't terminate before HTTP request finishes
    await sendTelegramAlert({
      name,
      email,
      message,
      type: isResumeLead ? "resume_lead" : "contact",
    });

    return NextResponse.json({ success: true, message: "Message sent successfully!" }, { status: 201 });
  } catch (err: unknown) {
    console.error("Contact Form Error:", err);
    return NextResponse.json({ error: "Failed to send message. Please try again later." }, { status: 500 });
  }
}

