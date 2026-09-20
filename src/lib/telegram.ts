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
      ? "📄 *NEW RESUME / HIRE REQUEST*"
      : "📬 *NEW CONTACT MESSAGE*";

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
    message.length > 200 ? message.slice(0, 200).trimEnd() + "…" : message;

  const text = [
    label,
    "",
    `👤 *Name:* ${escapeMarkdown(name)}`,
    `📧 *Email:* ${escapeMarkdown(email)}`,
    `🕐 *Time (BD):* ${bdTime}`,
    "",
    `💬 *Message:*`,
    `${escapeMarkdown(preview)}`,
    "",
    `🔗 [View in Admin](https://zahidhasantonmoy.vercel.app/admin/messages)`,
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
          parse_mode: "Markdown",
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

/** Escape special Markdown v1 characters for Telegram */
function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
}
