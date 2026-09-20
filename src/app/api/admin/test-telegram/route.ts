/**
 * GET /api/admin/test-telegram
 * Sends a test Telegram message and returns the raw API response.
 * Use this to debug Telegram config issues.
 * REMOVE this route after confirming Telegram works.
 */

import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Step 1: Check env vars
  if (!token) {
    return NextResponse.json({
      ok: false,
      step: "env_check",
      error: "TELEGRAM_BOT_TOKEN is missing from environment variables",
    }, { status: 500 });
  }

  if (!chatId) {
    return NextResponse.json({
      ok: false,
      step: "env_check",
      error: "TELEGRAM_CHAT_ID is missing from environment variables",
    }, { status: 500 });
  }

  // Step 2: Validate bot token by calling getMe
  let botInfo: any = null;
  try {
    const getMeRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    botInfo = await getMeRes.json();
    if (!getMeRes.ok || !botInfo.ok) {
      return NextResponse.json({
        ok: false,
        step: "getMe",
        error: "Invalid TELEGRAM_BOT_TOKEN — bot not found",
        telegram_response: botInfo,
      }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      step: "getMe",
      error: "Network error calling Telegram API: " + err.message,
    }, { status: 500 });
  }

  // Step 3: Try sending the actual test message
  const testText = [
    "✅ <b>Telegram Alert Test</b>",
    "",
    "If you see this, your Telegram integration is working perfectly!",
    "",
    `🤖 <b>Bot:</b> @${botInfo.result?.username || "unknown"}`,
    `📋 <b>Chat ID:</b> <code>${chatId}</code>`,
    `🕐 <b>Time:</b> ${new Date().toLocaleString("en-BD", { timeZone: "Asia/Dhaka" })}`,
  ].join("\n");

  try {
    const sendRes = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: testText,
          parse_mode: "HTML",
        }),
      }
    );

    const sendData = await sendRes.json();

    if (!sendRes.ok || !sendData.ok) {
      return NextResponse.json({
        ok: false,
        step: "sendMessage",
        error: "Message send failed",
        telegram_response: sendData,
        hint: sendData.description?.includes("chat not found")
          ? "HINT: The bot has not been started. Open Telegram, find your bot, and send /start"
          : sendData.description?.includes("Forbidden")
          ? "HINT: Bot cannot message this chat. Make sure the TELEGRAM_CHAT_ID is your personal chat ID, and you have messaged the bot first."
          : "Check telegram_response.description for details",
        bot: botInfo.result,
        chat_id_used: chatId,
      }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: "✅ Test message sent successfully! Check your Telegram.",
      bot: botInfo.result,
      chat_id_used: chatId,
      message_id: sendData.result?.message_id,
    });

  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      step: "sendMessage",
      error: "Network error: " + err.message,
    }, { status: 500 });
  }
}
