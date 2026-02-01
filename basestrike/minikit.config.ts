/**
 * Mini App manifest – powers /.well-known/farcaster.json.
 * Base Build docs: https://docs.base.org/mini-apps/quickstart/migrate-existing-apps
 * accountAssociation: generate at https://www.base.dev/preview?tab=account (Step 5); set via env in production.
 * All manifest URLs point to the canonical app URL (baserift.vercel.app) on Vercel; override with NEXT_PUBLIC_URL if needed.
 */
const CANONICAL_APP_URL = "https://baserift.vercel.app";
const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL ? CANONICAL_APP_URL : "http://localhost:3000");

// accountAssociation: only include when all three env vars are set (from Base Build Account association tool).
// Do not use placeholder/dummy values – Base Build shows "dummyaccount" otherwise.
const header = process.env.ACCOUNT_ASSOCIATION_HEADER ?? "";
const payload = process.env.ACCOUNT_ASSOCIATION_PAYLOAD ?? "";
const signature = process.env.ACCOUNT_ASSOCIATION_SIGNATURE ?? "";
const hasAccountAssociation = Boolean(header && payload && signature);

export const minikitConfig = {
  ...(hasAccountAssociation && {
    accountAssociation: { header, payload, signature },
  }),
  miniapp: {
    version: "1",
    name: "BaseRift",
    homeUrl: ROOT_URL,
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#1a1a1a",
    subtitle: "Tactical 2D Shooter",
    description: "Top-down tactical shooter with multiplayer and replays",
    screenshotUrls: [`${ROOT_URL}/screenshot.png`],
    primaryCategory: "games" as const,
    tags: ["game", "shooter", "multiplayer", "tactics", "replay"],
    tagline: "Tactical 2D shooter multiplayer",
    heroImageUrl: `${ROOT_URL}/hero.png`,
    ogTitle: "BaseRift – Tactical 2D Shooter",
    ogDescription: "Top-down tactical shooter with multiplayer and replays",
    ogImageUrl: `${ROOT_URL}/hero.png`,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    noindex: process.env.NODE_ENV !== "production",
  },
} as const;
