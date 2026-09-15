import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
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
          background: "linear-gradient(135deg, #030712 0%, #0f172a 50%, #1e1b4b 100%)",
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
              gap: "12px",
              padding: "10px 24px",
              borderRadius: "9999px",
              backgroundColor: "rgba(99, 102, 241, 0.2)",
              border: "1px solid rgba(99, 102, 241, 0.4)",
              color: "#a5b4fc",
              fontSize: "18px",
              fontWeight: 600,
            }}
          >
            ⚡ Portfolio & Engineering Showcase
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "18px",
              color: "#34d399",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              padding: "8px 20px",
              borderRadius: "9999px",
            }}
          >
            ● Available for Opportunities
          </div>
        </div>

        {/* Center: Hero Identity */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "68px",
              fontWeight: 900,
              letterSpacing: "-2px",
              color: "#ffffff",
              lineHeight: 1.1,
            }}
          >
            Zahid Hasan Tonmoy
          </div>
          <div
            style={{
              fontSize: "30px",
              fontWeight: 600,
              background: "linear-gradient(90deg, #60a5fa, #c084fc)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            MERN Full Stack Developer | Data Analyst | AI Agent Developer
          </div>
          <div
            style={{
              fontSize: "20px",
              color: "#94a3b8",
              maxWidth: "850px",
              lineHeight: 1.4,
            }}
          >
            Crafting high-performance web apps with Next.js, React, Node.js, and deploying intelligent AI agents & modern data solutions.
          </div>
        </div>

        {/* Bottom bar: Tech badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "12px" }}>
            {["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "Python & AI"].map((tech) => (
              <span
                key={tech}
                style={{
                  fontSize: "16px",
                  padding: "6px 16px",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                  fontWeight: 500,
                }}
              >
                {tech}
              </span>
            ))}
          </div>

          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#818cf8",
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
