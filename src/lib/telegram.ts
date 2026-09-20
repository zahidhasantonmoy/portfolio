/**
 * Telegram Alert Utility
 * Sends a formatted Telegram message to the configured chat.
 * Errors are caught and logged — never surfaced to the user.
 */

interface TelegramAlertPayload {
  name: string;
  email: string;
  message: string;
  type?: "contact" | "resume_lead";
}

export async function sendTelegramAlert({
  name,
  email,
  message,
  type = "contact",
}: TelegramAlertPayload): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set. Skipping alert.");
    return;
  }

  const label =
    type === "resume_lead"
      ? "📄 <b>NEW RESUME / HIRE REQUEST</b>"
      : "📬 <b>NEW CONTACT MESSAGE</b>";

  const bdTime = new Intl.DateTimeFormat("en-BD", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());

  const preview =
    message.length > 300 ? message.slice(0, 300).trimEnd() + "…" : message;

  const text = [
    label,
    "",
    `👤 <b>Name:</b> ${escapeHtml(name)}`,
    `📧 <b>Email:</b> ${escapeHtml(email)}`,
    `🕐 <b>Time (BD):</b> ${bdTime}`,
    "",
    `💬 <b>Message:</b>`,
    `<i>${escapeHtml(preview)}</i>`,
    "",
    `🔗 <a href="https://zahidhasantonmoy.vercel.app/admin/messages">View in Admin Panel</a>`,
  ].join("\n");

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("[Telegram] API error:", err);
    }
  } catch (err) {
    // Non-fatal — never block the main request
    console.error("[Telegram] Failed to send alert:", err);
  }
}

/** Escape HTML special characters for Telegram HTML mode */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

