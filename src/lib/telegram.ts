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

export async function sendTelegramBackupAlert({
  success,
  filename,
  bytes,
  secureUrl,
  stats,
  error,
}: {
  success: boolean;
  filename: string;
  bytes?: number;
  secureUrl?: string;
  stats?: Record<string, number>;
  error?: string;
}): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;

  const bdTime = new Intl.DateTimeFormat("en-BD", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());

  const lines = success
    ? [
        "💾 <b>AUTOMATIC DATABASE BACKUP COMPLETED</b>",
        "",
        `📁 <b>File:</b> <code>${escapeHtml(filename)}</code>`,
        bytes ? `📦 <b>Size:</b> ${(bytes / 1024).toFixed(1)} KB` : "",
        `🕐 <b>Time (BD):</b> ${bdTime}`,
        stats
          ? `📊 <b>Stats:</b> ${stats.total_posts ?? 0} Posts, ${stats.total_projects ?? 0} Projects, ${stats.total_dev_logs ?? 0} Dev Logs, ${stats.total_subscribers ?? 0} Subscribers`
          : "",
        "",
        secureUrl ? `🔗 <a href="${secureUrl}">Download Snapshot</a>` : "",
        `🔗 <a href="https://zahidhasantonmoy.vercel.app/admin">Open Admin Hub</a>`,
      ]
    : [
        "⚠️ <b>AUTOMATIC DATABASE BACKUP FAILED</b>",
        "",
        `❌ <b>Error:</b> ${escapeHtml(error || "Unknown error")}`,
        `🕐 <b>Time (BD):</b> ${bdTime}`,
        "",
        `🔗 <a href="https://zahidhasantonmoy.vercel.app/admin">Check Admin Hub</a>`,
      ];

  const text = lines.filter(Boolean).join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch (err) {
    console.error("[Telegram Backup Alert] Error:", err);
  }
}

