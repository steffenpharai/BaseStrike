/**
 * Game Constants
 */
/** Max players per team (matches map spawn count). */
export const MAX_PLAYERS_PER_TEAM = 5;

export const GAME_CONSTANTS = {
  TICK_RATE: 64,
  ROUND_TIME: 115, // seconds
  BUY_TIME: 10, // seconds
  PLANT_TIME: 3, // seconds
  DEFUSE_TIME: 7, // seconds
  BOMB_TIMER: 40, // seconds
  ROUNDS_TO_WIN: 3, // best of 5
  MAP_SIZE: { width: 1280, height: 960 },
  MAX_PLAYERS_PER_TEAM,
  /** Grid step for floor grid; must divide MAP_SIZE width and height evenly for a symmetrical grid. */
  GRID_SIZE: 80,
} as const;

/**
 * Virtual joystick layout (industry-standard: fixed base, left movement zone, above HUD bar).
 * Position and radius must match TouchControls and GameScene guard/zone. 60px+ for thumb reach.
 */
export const JOYSTICK_LAYOUT = {
  /** Horizontal margin from left edge (px). Centered in second grid cell (GRID_SIZE=80 → center at 120). */
  MARGIN_LEFT: 120,
  /** Vertical margin from bottom edge so joystick sits above HUD bottom bar (px). */
  MARGIN_BOTTOM: 200,
  /** Base circle radius (≥60px touch target; Base design guidelines). */
  BASE_RADIUS: 60,
  /** Thumb/handle radius. */
  THUMB_RADIUS: 28,
  /** Max distance thumb moves from center (stick travel). */
  THUMB_TRAVEL: 34,
} as const;

/**
 * Weapon Stats (magazineSize and reloadTimeMs for HUD ammo display).
 */
export const WEAPON_STATS = {
  pistol: {
    damage: 25,
    fireRate: 300, // ms
    cost: 0, // free starter weapon
    range: 300,
    magazineSize: 12,
    reloadTimeMs: 1200,
  },
  rifle: {
    damage: 35,
    fireRate: 150,
    cost: 200,
    range: 500,
    magazineSize: 30,
    reloadTimeMs: 2000,
  },
  shotgun: {
    damage: 80,
    fireRate: 800,
    cost: 150,
    range: 150,
    magazineSize: 8,
    reloadTimeMs: 2500,
  },
} as const;

/**
 * Utility Stats
 */
export const UTILITY_STATS = {
  flashbang: {
    cost: 50,
    duration: 2000, // ms
    radius: 200,
  },
  smoke: {
    cost: 75,
    duration: 15000, // ms
    radius: 150,
  },
} as const;

/**
 * Base Pay Constants
 */
export const PAYMENT_CONSTANTS = {
  RANKED_ENTRY_FEE_WEI: "1000000000000000", // 0.001 ETH
  TREASURY_ADDRESS: "0x0000000000000000000000000000000000000000", // Replace in production
} as const;

/**
 * Network Constants
 */
export const NETWORK_CONSTANTS = {
  BASE_SEPOLIA_CHAIN_ID: 84532,
  BASE_MAINNET_CHAIN_ID: 8453,
  DEFAULT_RPC_URL: "https://sepolia.base.org",
} as const;

/**
 * Team branding: Ethereum vs Solana (Base Mini App gameplay theme).
 * Team 1 = Ethereum (defuses bomb); Team 2 = Solana (plants bomb).
 * ETH blue, SOL orange for high contrast and WCAG AA+.
 */
export const TEAM_BRANDING = {
  ethereum: {
    name: "Ethereum",
    shortName: "ETH",
    /** Primary blue (#0F6CDF) for in-game player tint and HUD. */
    colorHex: 0x0f6cdf,
    colorCss: "#0F6CDF",
  },
  solana: {
    name: "Solana",
    shortName: "SOL",
    /** Orange accent (#F97316) for in-game player tint and HUD. */
    colorHex: 0xf97316,
    colorCss: "#F97316",
  },
} as const;
