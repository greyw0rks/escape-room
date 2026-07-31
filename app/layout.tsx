import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Three voices, strictly separated — see globals.css.
// `display: swap` so the room's text is readable before the fonts land;
// on a 2G MiniPay connection a blocking font would mean a blank screen.
const display = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  axes: ["SOFT", "WONK", "opsz"],
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
  themeColor: "#0a0810",
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
