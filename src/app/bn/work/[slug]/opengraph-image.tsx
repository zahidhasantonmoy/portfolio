import { ImageResponse } from "next/og";
import { getCaseStudyBySlug, getAllCaseStudies } from "@/lib/case-studies";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export async function generateStaticParams() {
  const all = await getAllCaseStudies({ status: "published" });
  return all.map((cs) => ({ slug: cs.slug }));
}

export default async function Image({
  params,
}: {
  params: { slug: string };
}) {
  const cs = await getCaseStudyBySlug(params.slug);

  const projectName = cs?.project_name || "প্রজেক্ট কেস স্টাডি";
  const title = cs?.bangla.title || cs?.english.title || `${projectName}: আর্কিটেকচার কেস স্টাডি`;
  const techStack = cs?.tech_stack?.slice(0, 5) || ["React", "Node.js", "PostgreSQL"];

  // Load Bengali font from fast CDN with edge caching to render crisp Bengali script without tofu boxes
  let fontData: ArrayBuffer | null = null;
  try {
    const fontRes = await fetch(
      "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSansBengali/NotoSansBengali-Bold.ttf",
      { cache: "force-cache" }
    );
    if (fontRes.ok) {
      fontData = await fontRes.arrayBuffer();
    }
  } catch (err) {
    console.warn("Noto Sans Bengali font load fallback:", err);
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "65px 75px",
          background: "linear-gradient(135deg, #050814 0%, #0c1222 50%, #151a3a 100%)",
          fontFamily: fontData ? "'Noto Sans Bengali', sans-serif" : "sans-serif",
          color: "white",
        }}
      >
        {/* Top bar: Badge & Metadata */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 20px",
                borderRadius: "9999px",
                backgroundColor: "rgba(99, 102, 241, 0.2)",
                border: "1px solid rgba(99, 102, 241, 0.45)",
                color: "#a5b4fc",
                fontSize: "18px",
                fontWeight: 700,
                letterSpacing: "0.5px",
              }}
            >
              ⚡ কেস স্টাডি • কারিগরি বিশ্লেষণ
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "18px",
              color: "#34d399",
              backgroundColor: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              padding: "8px 20px",
              borderRadius: "9999px",
              fontWeight: 600,
            }}
          >
            ● প্রোডাকশন আর্কিটেকচার
          </div>
        </div>

        {/* Center: Project Headline & Tech Stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <span
              style={{
                fontSize: "40px",
                fontWeight: 800,
                color: "#38bdf8",
                letterSpacing: "-0.5px",
              }}
            >
              {projectName}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: title.length > 55 ? "42px" : "52px",
              fontWeight: 900,
              lineHeight: 1.25,
              color: "#f8fafc",
              maxHeight: "190px",
              overflow: "hidden",
            }}
          >
            {title}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "4px" }}>
            {techStack.map((tech) => (
              <span
                key={tech}
                style={{
                  fontSize: "16px",
                  padding: "6px 16px",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "8px",
                  color: "#cbd5e1",
                  fontWeight: 600,
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom bar: Author Branding & Link */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "9999px",
                background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: "bold",
                color: "white",
                boxShadow: "0 4px 15px rgba(79, 70, 229, 0.4)",
              }}
            >
              Z
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "22px", fontWeight: "bold", color: "#f8fafc" }}>
                জাহিদ হাসান তন্ময় (Zahid Hasan Tonmoy)
              </span>
              <span style={{ fontSize: "15px", color: "#94a3b8" }}>
                ফুল-স্ট্যাক সফটওয়্যার আর্কিটেক্ট ও এআই ডেভেলপার
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "18px",
              fontWeight: 600,
              color: "#cbd5e1",
              backgroundColor: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              padding: "10px 22px",
              borderRadius: "12px",
            }}
          >
            zahidhasantonmoy.vercel.app/bn/work
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [
            {
              name: "Noto Sans Bengali",
              data: fontData,
              style: "normal",
              weight: 700,
            },
          ]
        : undefined,
    }
  );
}
