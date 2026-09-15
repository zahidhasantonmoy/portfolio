import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const maxDuration = 60; // 60s for batch email sending

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { subject, body } = await request.json();

    if (!subject || !body) {
      return NextResponse.json({ error: "Subject and body are required." }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "RESEND_API_KEY is not configured." }, { status: 500 });
    }

    // 1. Fetch active subscribers
    const subscribers = await sql`SELECT email FROM subscribers WHERE status = 'active'`;

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: "No active subscribers found." }, { status: 400 });
    }

    // Prepare email addresses array
    const toEmails = subscribers.map((sub: any) => sub.email);

    // 2. Send Emails using Resend (Bcc is recommended for mass sending, or we can send individually)
    // Sending individually to ensure unsubscribe links could work in the future, 
    // but Resend recommends using the Batch API for > 50 emails. For simplicity, we use the standard API with BCC or a loop.
    
    // For small-to-medium lists, Resend Batch API is best:
    const emailData = toEmails.map(email => ({
      from: 'Zahid Hasan Tonmoy <newsletter@zahidhasantonmoy.com>', // User needs to configure domain in Resend
      to: [email],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          ${body}
          <hr style="margin-top: 40px; border: none; border-top: 1px solid #eaeaea;" />
          <p style="font-size: 12px; color: #666; text-align: center;">
            You received this email because you subscribed to Zahid Hasan Tonmoy's newsletter.<br/>
            <a href="https://zahidhasantonmoy.vercel.app/newsletter" style="color: #666;">Manage subscription</a>
          </p>
        </div>
      `,
    }));

    // Actually, sending batch is limited to 100 emails per batch in Resend.
    // We will batch them in chunks of 100.
    const chunkArray = (arr: any[], size: number) =>
      arr.length > size
        ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
        : [arr];

    const chunks = chunkArray(emailData, 100);
    let totalSent = 0;

    for (const chunk of chunks) {
      const { data, error } = await resend.batch.send(chunk);
      if (error) {
        console.error("Resend Error:", error);
        throw new Error(error.message);
      }
      totalSent += chunk.length;
    }

    // 3. Save campaign to database
    await sql`
      INSERT INTO newsletter_campaigns (subject, body, sent_count)
      VALUES (${subject}, ${body}, ${totalSent})
    `;

    return NextResponse.json({ success: true, sentCount: totalSent });
  } catch (error: any) {
    console.error("Newsletter Send Error:", error);
    return NextResponse.json({ error: error.message || "Failed to send newsletter." }, { status: 500 });
  }
}
