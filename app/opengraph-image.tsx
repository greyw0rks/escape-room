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
          background: "#a8d8f0",
          backgroundImage:
            "linear-gradient(180deg, #a8d8f0 0%, #a8d8f0 46%, #f5f5f0 46%, #f5f5f0 100%)",
          color: "#111111",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <svg width="72" height="72" viewBox="0 0 64 64">
            <rect width="64" height="64" fill="#ffd83d" />
            <path
              d="M0 0h64v4H0zM0 60h64v4H0zM0 0h4v64H0zM60 0h4v64h-4z"
              fill="#111111"
            />
            <path
              d="M24 16h16v4H24zM20 20h24v4H20zM20 24h24v4H20zM20 28h24v4H20zM24 32h16v4H24zM28 36h8v4h-8zM24 40h16v4H24zM20 44h24v4H20z"
              fill="#111111"
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
            color: "#4a4a4a",
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
            height: 8,
            width: 260,
            background: "#ffd83d",
            border: "1px solid #111111",
          }}
        />
      </div>
    ),
    size
  );
}
