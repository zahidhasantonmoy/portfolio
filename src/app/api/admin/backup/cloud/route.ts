import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  generateBackupPayload,
  uploadBackupToCloudinary,
  listCloudinaryBackups,
  getCloudinaryClient,
} from "@/lib/backup";

export const dynamic = "force-dynamic";

/**
 * GET: List all backup snapshots stored in Cloudinary
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const isConfigured = Boolean(getCloudinaryClient());
    if (!isConfigured) {
      return NextResponse.json({
        configured: false,
        backups: [],
        message: "Cloudinary credentials (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not configured.",
      });
    }

    const result = await listCloudinaryBackups();
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("[Cloudinary Backup GET] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch cloud backups";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST: Generate full backup and save snapshot directly to Cloudinary
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const isConfigured = Boolean(getCloudinaryClient());
    if (!isConfigured) {
      return NextResponse.json(
        {
          error:
            "Cloudinary credentials missing in environment variables. Please check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
        },
        { status: 400 }
      );
    }

    const backupPayload = await generateBackupPayload();
    const dateStr = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `portfolio_backup_${dateStr}`;
    const jsonString = JSON.stringify(backupPayload, null, 2);

    const uploadRes = await uploadBackupToCloudinary(jsonString, filename);

    return NextResponse.json({
      success: true,
      message: "Backup snapshot successfully uploaded to Cloudinary",
      file: uploadRes,
      stats: backupPayload.stats,
    });
  } catch (error: unknown) {
    console.error("[Cloudinary Backup POST] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to upload cloud backup";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
