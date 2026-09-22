import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import fs from "fs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "portfolio_preset";

    // ── Strategy 1: Signed Cloudinary Upload (When full API keys are present) ──
    if (cloudName && apiKey && apiSecret) {
      try {
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
        });

        const uploadResponse: any = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "portfolio/blog",
              resource_type: "auto",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(buffer);
        });

        if (uploadResponse?.secure_url) {
          return NextResponse.json({
            url: uploadResponse.secure_url,
            public_id: uploadResponse.public_id,
            source: "cloudinary_signed",
          });
        }
      } catch (cldErr: any) {
        console.warn("[upload-image] Signed Cloudinary upload failed, attempting fallback:", cldErr?.message);
      }
    }

    // ── Strategy 2: Unsigned Cloudinary Upload (When cloudName exists or uploadPreset is configured) ──
    if (cloudName && uploadPreset) {
      try {
        const cldForm = new FormData();
        const blob = new Blob([buffer], { type: file.type || "image/jpeg" });
        cldForm.append("file", blob, file.name || "image.jpg");
        cldForm.append("upload_preset", uploadPreset);
        cldForm.append("folder", "portfolio/blog");

        const cldRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: cldForm,
        });

        if (cldRes.ok) {
          const cldData = await cldRes.json();
          if (cldData?.secure_url) {
            return NextResponse.json({
              url: cldData.secure_url,
              public_id: cldData.public_id,
              source: "cloudinary_unsigned",
            });
          }
        } else {
          const errText = await cldRes.text();
          console.warn("[upload-image] Unsigned Cloudinary upload returned non-OK:", errText);
        }
      } catch (cldUnsignedErr: any) {
        console.warn("[upload-image] Unsigned Cloudinary request failed:", cldUnsignedErr?.message);
      }
    }

    // ── Strategy 3: Local Filesystem Storage (Local Dev & Self-Hosted Fallback) ──
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const originalName = file.name || "image.jpg";
      const ext = path.extname(originalName) || ".jpg";
      const baseName = path
        .basename(originalName, ext)
        .replace(/[^\w-]/g, "_")
        .slice(0, 40) || "upload";
      const uniqueFileName = `${Date.now()}_${baseName}${ext}`;
      const filePath = path.join(uploadsDir, uniqueFileName);

      await fs.promises.writeFile(filePath, buffer);

      return NextResponse.json({
        url: `/uploads/${uniqueFileName}`,
        public_id: uniqueFileName,
        source: "local_filesystem",
      });
    } catch (fsErr: any) {
      console.warn("[upload-image] Local filesystem write failed (likely read-only serverless):", fsErr?.message);
    }

    // ── Strategy 4: Base64 Data URI Fallback (Fail-safe for serverless without Cloudinary) ──
    if (buffer.length <= 4 * 1024 * 1024) {
      const mime = file.type || "image/jpeg";
      const dataUri = `data:${mime};base64,${buffer.toString("base64")}`;
      return NextResponse.json({
        url: dataUri,
        public_id: `data_${Date.now()}`,
        source: "base64_fallback",
      });
    }

    return NextResponse.json(
      {
        error:
          "Cloudinary credentials missing (CLOUDINARY_API_SECRET / CLOUDINARY_API_KEY). Please add them to your .env.local file or hosting environment variables.",
      },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
