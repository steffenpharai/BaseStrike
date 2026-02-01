const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000";

export const minikitConfig = {
  accountAssociation: {
    header: process.env.ACCOUNT_ASSOCIATION_HEADER || "",
    payload: process.env.ACCOUNT_ASSOCIATION_PAYLOAD || "",
    signature: process.env.ACCOUNT_ASSOCIATION_SIGNATURE || "",
  },
  miniapp: {
    version: "1",
    name: "BaseStrike",
    subtitle: "Tactical 2D Shooter",
    description: "Top-down tactical shooter with multiplayer and replays",
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#1a1a1a",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "games",
    tags: ["game", "shooter", "multiplayer", "tactics", "replay"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;
