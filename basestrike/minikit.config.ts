/**
 * Mini App manifest config – powers /.well-known/farcaster.json and embed metadata.
 * Follows: https://docs.base.org/mini-apps/quickstart/create-new-miniapp
 */
const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000";

// Account association from Base Build (base.dev) – verifies ownership, unlocks analytics & builder rewards.
// Env vars override these defaults when set (e.g. in production).
const DEFAULT_ACCOUNT_ASSOCIATION = {
  header: "eyJmaWQiOi0xLCJ0eXBlIjoiYXV0aCIsImtleSI6IjB4N2Q0ZjMyZmNiZkVjZTdDNDA1MzYzNzExQzZCMDM5YjA5NDg4Zjk4QyJ9",
  payload: "eyJkb21haW4iOiJiYXNlcmlmdC52ZXJjZWwuYXBwIn0",
  signature:
    "AAAAAAAAAAAAAAAAyhG94Fl3s2MRZwKIYr4qFzl2yhEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAiSCrVbLAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAul7REO_bo9AFv8iC11NYrLu4WEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASQ_-6NvAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAOA0sAalw0GCpgk9777aZZVJLW0wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAPhSELIcxQMC9He6VmhtIBncm2etAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBushLm4hzgkHjHTgIzcpgOqcHdVxvtgmzvVxGNkj6Q2VPbtErdE4zK0pTl9k36-hKYVz7PjGUDyKfEMQn5DFgSBsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZJJkkmSSZJJkkmSSZJJkkmSSZJJkkmSSZJJkkmSSZJI",
};

export const minikitConfig = {
  accountAssociation: {
    header: process.env.ACCOUNT_ASSOCIATION_HEADER || DEFAULT_ACCOUNT_ASSOCIATION.header,
    payload: process.env.ACCOUNT_ASSOCIATION_PAYLOAD || DEFAULT_ACCOUNT_ASSOCIATION.payload,
    signature: process.env.ACCOUNT_ASSOCIATION_SIGNATURE || DEFAULT_ACCOUNT_ASSOCIATION.signature,
  },
  miniapp: {
    version: "1",
    name: "BaseRift",
    subtitle: "Tactical 2D Shooter",
    description: "Top-down tactical shooter with multiplayer and replays",
    screenshotUrls: [`${ROOT_URL}/screenshot.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    /** Used by Base app for embed/preview; same as hero for consistency. */
    imageUrl: `${ROOT_URL}/hero.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#1a1a1a",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "games",
    tags: ["game", "shooter", "multiplayer", "tactics", "replay"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Tactical 2D shooter multiplayer",
    ogTitle: "BaseRift – Tactical 2D Shooter",
    ogDescription: "Top-down tactical shooter with multiplayer and replays",
    ogImageUrl: `${ROOT_URL}/hero.png`,
    noindex: process.env.NODE_ENV !== "production",
  },
} as const;
