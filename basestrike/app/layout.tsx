import type { Metadata, Viewport } from "next";
import { RootProvider } from "./rootProvider";
import "./globals.css";

const BASE_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  title: "BaseRift",
  description: "Top-down tactical shooter with multiplayer and replays",
  other: {
    "base:app_id": "697eea9d2aafa0bc9ad8a3b6",
    "fc:miniapp": JSON.stringify({
      version: "next",
      imageUrl: `${BASE_URL}/hero.png`,
      button: {
        title: "Launch BaseRift",
        action: {
          type: "launch_miniapp",
          name: "BaseRift",
          url: BASE_URL,
          splashImageUrl: `${BASE_URL}/splash.png`,
          splashBackgroundColor: "#1a1a1a",
        },
      },
    }),
  },
};

/** Mobile-first: small viewports, portrait; safe area for notched devices (Base Mini App design guidelines). */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
