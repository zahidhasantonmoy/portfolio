import { ImageResponse } from "next/og";
import { getJournalEntryByDate } from "@/lib/blog";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const MOOD_MAP: Record<string, { label: string; emoji: string; color: string; border: string }> = {
  productive: { label: "Productive Day", emoji: "🚀", color: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.4)" },
  learning: { label: "Learning Mode", emoji: "📚", color: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.4)" },
  breakthrough: { label: "Breakthrough!", emoji: "💡", color: "rgba(234, 179, 8, 0.15)", border: "rgba(234, 179, 8, 0.4)" },
  stuck: { label: "Problem Solving", emoji: "😤", color: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.4)" },
};

export default async function Image({
  params,
}: {
  params: { date: string };
}) {
  const entry = await getJournalEntryByDate(params.date);

  const title = entry?.title || `Dev Journal Entry — ${params.date}`;
  const mood = entry?.mood ? (MOOD_MAP[entry.mood] || MOOD_MAP.productive) : MOOD_MAP.productive;
  const techStack = entry?.tech_stack?.slice(0, 5) || ["Full Stack", "Engineering"];
  const formattedDate = new Date(params.date + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

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
          background: "linear-gradient(135deg, #050814 0%, #0c1222 50%, #064e3b 100%)",
          fontFamily: "sans-serif",
          color: "white",
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 22px",
              borderRadius: "9999px",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              color: "#6ee7b7",
              fontSize: "19px",
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            <span>📓 Dev Journal Log</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "18px",
              color: "#f1f5f9",
              backgroundColor: mood.color,
              border: `1px solid ${mood.border}`,
              padding: "8px 20px",
              borderRadius: "9999px",
              fontWeight: 600,
            }}
          >
            <span>{mood.emoji}</span>
            <span>{mood.label}</span>
          </div>
        </div>

        {/* Center: Title & Tech Stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: title.length > 55 ? "48px" : "60px",
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: "-1px",
              color: "#f8fafc",
              maxHeight: "220px",
              overflow: "hidden",
            }}
          >
            {title}
          </div>

          {/* Tech Stack Pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {techStack.map((tech, idx) => (
              <div
                key={idx}
                style={{
                  fontSize: "17px",
                  fontWeight: 600,
                  color: "#cbd5e1",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  padding: "6px 16px",
                  borderRadius: "8px",
                }}
              >
                #{tech}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Footer: Branding */}
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
                background: "linear-gradient(135deg, #10b981, #059669)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: "bold",
                color: "white",
                boxShadow: "0 4px 15px rgba(16, 185, 129, 0.35)",
              }}
            >
              Z
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "22px", fontWeight: "bold", color: "#f8fafc" }}>
                Zahid Hasan Tonmoy
              </span>
              <span style={{ fontSize: "15px", color: "#94a3b8" }}>
                MERN Full Stack Developer & AI Agent Developer
              </span>
            </div>
          </div>

          <div
            style={{
              fontSize: "17px",
              fontWeight: 600,
              color: "#34d399",
              letterSpacing: "0.5px",
            }}
          >
            zahidhasantonmoy.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
