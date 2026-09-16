import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);

  const title = post?.title_bn || post?.title_en || "জাহিদ হাসান তন্ময়ের ব্লগ";
  const category = post?.categories?.name_bn || post?.categories?.name_en || "প্রযুক্তি ও প্রোগ্রামিং";
  const categoryColor = post?.categories?.color || "#6366f1";
  const readTime = post?.read_time_min ? `${post.read_time_min} মিনিট পাঠ` : "৩ মিনিট পাঠ";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          background: "linear-gradient(135deg, #090d16 0%, #111827 50%, #1e1b4b 100%)",
          fontFamily: "sans-serif",
          color: "white",
        }}
      >
        {/* Top bar: Category & Read Time */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 24px",
              borderRadius: "9999px",
              backgroundColor: categoryColor,
              color: "#ffffff",
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            {category}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "20px",
              color: "#94a3b8",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              padding: "8px 20px",
              borderRadius: "9999px",
            }}
          >
            ⏱️ {readTime}
          </div>
        </div>

        {/* Middle: Title */}
        <div
          style={{
            display: "flex",
            fontSize: title.length > 50 ? "46px" : "58px",
            fontWeight: 900,
            lineHeight: 1.25,
            color: "#f8fafc",
            maxHeight: "260px",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </div>

        {/* Bottom bar: Author branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            paddingTop: "28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "9999px",
                background: "linear-gradient(135deg, #4f46e5, #9333ea)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                fontWeight: "bold",
                color: "white",
                boxShadow: "0 4px 15px rgba(79, 70, 229, 0.4)",
              }}
            >
              Z
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "24px", fontWeight: "bold", color: "#f8fafc" }}>
                জাহিদ হাসান তন্ময় (Zahid Hasan Tonmoy)
              </span>
              <span style={{ fontSize: "16px", color: "#818cf8" }}>
                MERN Full Stack Developer & AI Agent Developer
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "18px",
              color: "#cbd5e1",
              backgroundColor: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              padding: "10px 22px",
              borderRadius: "14px",
            }}
          >
            zahidhasantonmoy.vercel.app/bn
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
