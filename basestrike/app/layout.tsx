import type { Metadata, Viewport } from "next";
import { RootProvider } from "./rootProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "BaseRift",
  description: "Top-down tactical shooter with multiplayer and replays",
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
