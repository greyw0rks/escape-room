import { ImageResponse } from "next/og";

// Social preview. Generated at build time from the same tokens as the app, so
// it can never drift from the product's actual look the way a hand-exported
// PNG does.
export const alt = "Escape — a new room every day";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 84,
          background: "#0a0810",
          backgroundImage:
            "radial-gradient(1000px 600px at 22% -10%, rgba(240,168,72,0.30), transparent 70%)",
          color: "#f2ece2",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <svg width="72" height="72" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="12" fill="#1f1a2b" />
            <rect
              x="0.75"
              y="0.75"
              width="62.5"
              height="62.5"
              rx="11.25"
              fill="none"
              stroke="#f0a848"
              strokeOpacity="0.34"
            />
            <path d="M32 24 L46 55 H18 Z" fill="#f0a848" opacity="0.16" />
            <path
              d="M32 17.5a8 8 0 0 0-4.2 14.8L24.5 46h15l-3.3-13.7A8 8 0 0 0 32 17.5z"
              fill="#f0a848"
            />
          </svg>
          <span style={{ fontSize: 40, letterSpacing: 12, textTransform: "uppercase" }}>
            Escape
          </span>
        </div>

        <div style={{ display: "flex", fontSize: 82, lineHeight: 1.1, marginTop: 40, letterSpacing: -2 }}>
          A new room, every day.
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 34,
            color: "#a89fb4",
            marginTop: 26,
            lineHeight: 1.4,
          }}
        >
          <span>Search it. Question whoever is inside.</span>
          <span>Get out before the clock runs down.</span>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 46,
            height: 4,
            width: 260,
            background: "linear-gradient(90deg,#8a5f24,#ffc677)",
          }}
        />
      </div>
    ),
    size
  );
}
