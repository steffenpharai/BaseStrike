/**
 * Configuration management for BaseRift
 * Validates required environment variables and provides typed config
 */

function getEnv(key: string, required: boolean = true): string {
  const value = process.env[key];
  if (required && !value) {
    // Only throw in production for required vars
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
  return value || "";
}

export const config = {
  // Mini App Config
  miniapp: {
    domain: getEnv("MINIAPP_DOMAIN", false) || "localhost:3000",
    homeUrl: getEnv("NEXT_PUBLIC_URL", false) || "http://localhost:3000",
    iconUrl: `${getEnv("NEXT_PUBLIC_URL", false) || "http://localhost:3000"}/icon.png`,
    splashUrl: `${getEnv("NEXT_PUBLIC_URL", false) || "http://localhost:3000"}/splash.png`,
    webhookUrl: `${getEnv("NEXT_PUBLIC_URL", false) || "http://localhost:3000"}/api/webhook`,
  },

  // Account Association (from Base Build tool)
  accountAssociation: {
    header: getEnv("ACCOUNT_ASSOCIATION_HEADER", false),
    payload: getEnv("ACCOUNT_ASSOCIATION_PAYLOAD", false),
    signature: getEnv("ACCOUNT_ASSOCIATION_SIGNATURE", false),
  },

  // Neynar
  neynar: {
    apiKey: getEnv("NEYNAR_API_KEY", false),
  },

  // Session
  session: {
    secret: getEnv("SESSION_SECRET", false) || "dev-secret-change-in-production",
  },

  // Base Pay
  basePay: {
    treasuryAddress: getEnv("BASE_PAY_TREASURY_ADDRESS", false) || "0x0000000000000000000000000000000000000000",
  },

  // Contracts
  contracts: {
    cosmeticsAddress: getEnv("COSMETICS_CONTRACT_ADDRESS", false),
    minterPrivateKey: getEnv("MINTER_PRIVATE_KEY", false),
  },

  // Network
  network: {
    chainId: parseInt(getEnv("NEXT_PUBLIC_CHAIN_ID", false) || "84532"),
    rpcUrl: getEnv("NEXT_PUBLIC_RPC_URL", false) || "https://sepolia.base.org",
  },

  // Environment
  isDev: process.env.NODE_ENV !== "production",
  isProduction: process.env.NODE_ENV === "production",
  devAuthBypass: process.env.DEV_AUTH_BYPASS === "true",
} as const;
