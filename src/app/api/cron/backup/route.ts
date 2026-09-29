import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  generateBackupPayload,
  uploadBackupToCloudinary,
  getCloudinaryClient,
} from "@/lib/backup";
import { sendTelegramBackupAlert } from "@/lib/telegram";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60s max execution

/**
 * Validates request authorization:
 * - Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`
 * - Custom header: `x-cron-secret`
 * - Fallback: internal Vercel cron invocation headers (x-vercel-cron / user-agent)
 * - Admin session (NextAuth) permitted for manual trigger from browser
 * - Query param ?secret= allowed if matches CRON_SECRET or in non-prod
 */
async function isAuthorized(req: Request): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  const xCronSecret = req.headers.get("x-cron-secret");
  const userAgent = req.headers.get("user-agent") || "";
  const isVercelCron =
    userAgent.includes("vercel-cron") || Boolean(req.headers.get("x-vercel-cron"));

  // 1. If CRON_SECRET is configured, check bearer or header
  if (cronSecret) {
    if (authHeader === `Bearer ${cronSecret}` || xCronSecret === cronSecret) {
      return true;
    }
    const { searchParams } = new URL(req.url);
    if (searchParams.get("secret") === cronSecret) {
      return true;
    }
  }

  // 2. If Vercel Cron triggered it directly and no CRON_SECRET was set yet
  if (isVercelCron) {
    return true;
  }

  // 3. Check admin session (NextAuth) so logged-in admin can trigger manually
  try {
    const session = await getServerSession(authOptions);
    if (session) return true;
  } catch {
    // Session check failed
  }

  // 4. In development, allow localhost
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return false;
}

async function handleWeeklyBackup(req: Request) {
  const authorized = await isAuthorized(req);
  if (!authorized) {
    return NextResponse.json(
      { error: "Unauthorized cron trigger. Bearer token or valid CRON_SECRET required." },
      { status: 401 }
    );
  }

  const isConfigured = Boolean(getCloudinaryClient());
  if (!isConfigured) {
    const errText =
      "Cloudinary credentials missing (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_BACKUP_KEY / CLOUDINARY_API_KEY, CLOUDINARY_BACKUP_SECRET / CLOUDINARY_API_SECRET).";
    await sendTelegramBackupAlert({
      success: false,
      filename: "weekly_auto_backup",
      error: errText,
    });
    return NextResponse.json({ error: errText }, { status: 400 });
  }

  try {
    console.log("[Weekly Auto Backup Cron] Generating full database snapshot...");
    const backupPayload = await generateBackupPayload();
    const dateStr = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `auto_backup_weekly_${dateStr}.json`;
    const jsonString = JSON.stringify(backupPayload, null, 2);

    console.log(`[Weekly Auto Backup Cron] Uploading snapshot ${filename} to Cloudinary...`);
    const uploadRes = await uploadBackupToCloudinary(jsonString, filename);

    // Send Telegram Notification
    await sendTelegramBackupAlert({
      success: true,
      filename,
      bytes: uploadRes.bytes,
      secureUrl: uploadRes.secure_url,
      stats: backupPayload.stats,
    });

    return NextResponse.json({
      success: true,
      message: "Weekly automatic database backup completed successfully and uploaded to Cloudinary.",
      file: {
        public_id: uploadRes.public_id,
        secure_url: uploadRes.secure_url,
        bytes: uploadRes.bytes,
        created_at: uploadRes.created_at,
      },
      stats: backupPayload.stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Weekly Auto Backup Cron] Error:", error);
    const message =
      error?.message ||
      error?.error?.message ||
      (typeof error === "string" ? error : JSON.stringify(error)) ||
      "Failed to execute weekly auto backup";

    await sendTelegramBackupAlert({
      success: false,
      filename: `weekly_auto_backup_${new Date().toISOString()}`,
      error: message,
    });

    return NextResponse.json(
      {
        error: "Failed to execute weekly auto backup",
        details: message,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return handleWeeklyBackup(req);
}

export async function POST(req: Request) {
  return handleWeeklyBackup(req);
}
