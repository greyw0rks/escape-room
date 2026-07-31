import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Serif display over sans body, per heal-grow-ui-spec.md — the split is what
// makes the layout read as editorial rather than as an app template.
// `display: swap` so text is readable before the fonts land; on a 2G MiniPay
// connection a blocking font would mean a blank screen.
const display = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500"],
});

const body = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
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
  themeColor: "#1a1a1a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
