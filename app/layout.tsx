import type { Metadata, Viewport } from "next";
import { Silkscreen, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Bitmap display over monospace body, per docs/retro-mac-ui-spec.md.
// Silkscreen rather than Press Start 2P: the latter is roughly 40% wider per
// glyph and wraps headings badly at MiniPay's 360px minimum.
// `display: swap` so text is readable before the fonts land; on a 2G MiniPay
// connection a blocking font would mean a blank screen.
const display = Silkscreen({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "700"],
});

// Body and mono are the same face. Everything you actually read is monospace
// here, so a second body family would only cost bundle for no visual gain.
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

const SITE = "https://escape-room-chi-five.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Escape — a new room every day",
  description:
    "A new AI-built escape room every day. Search it, question whoever is inside, and get out before the clock runs down.",
  applicationName: "Escape",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Escape — a new room every day",
    description:
      "Search the room, question whoever is inside, and get out before the clock runs down.",
    url: SITE,
    siteName: "Escape",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Escape — a new room every day",
    description: "A new AI-built escape room every day.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#a8d8f0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
