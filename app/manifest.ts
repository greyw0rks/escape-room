import type { MetadataRoute } from "next";

// Installable as a home-screen app. MiniPay surfaces the name and icon from
// here, and its listing rules require both to be clearly ours rather than
// MiniPay's own branding.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Escape — a new room every day",
    short_name: "Escape",
    description:
      "A new AI-built escape room every day. Search it, question whoever is inside, and get out before the clock runs down.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0810",
    theme_color: "#0a0810",
    orientation: "portrait",
    categories: ["games", "puzzle"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
