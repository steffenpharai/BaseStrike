import type { Metadata, Viewport } from "next";
import { RootProvider } from "./rootProvider";
import "./globals.css";

// Canonical app URL so manifest and embed metadata point to baserift.vercel.app on Vercel
const BASE_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL ? "https://baserift.vercel.app" : "http://localhost:3000");

export const metadata: Metadata = {
  title: "BaseRift",
  description: "Move, aim, shoot—climb the ranks in this tactical 2D shooter",
  other: {
    "base:app_id": "697fd1b02aafa0bc9ad8a4c2",
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

/** Mobile-only: Base Mini App viewport (design guidelines). No scroll; full viewport; safe-area for notched devices. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
  userScalable: false,
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
