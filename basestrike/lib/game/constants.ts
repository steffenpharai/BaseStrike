/**
 * Game Constants
 */
export const GAME_CONSTANTS = {
  TICK_RATE: 64,
  ROUND_TIME: 115, // seconds
  BUY_TIME: 10, // seconds
  PLANT_TIME: 3, // seconds
  DEFUSE_TIME: 7, // seconds
  BOMB_TIMER: 40, // seconds
  ROUNDS_TO_WIN: 3, // best of 5
  MAP_SIZE: { width: 1280, height: 960 },
  /** Grid step for floor grid; must divide MAP_SIZE width and height evenly for a symmetrical grid. */
  GRID_SIZE: 80,
} as const;

/**
 * Virtual joystick layout (industry-standard: fixed base, left movement zone, above HUD bar).
 * Position and radius must match TouchControls and GameScene guard/zone.
 */
export const JOYSTICK_LAYOUT = {
  /** Horizontal margin from left edge (px). Centered in second grid cell (GRID_SIZE=80 → center at 120). */
  MARGIN_LEFT: 120,
  /** Vertical margin from bottom edge so joystick sits above HUD bottom bar (px). */
  MARGIN_BOTTOM: 200,
  /** Base circle radius (≥44px touch target; industry-standard size). */
  BASE_RADIUS: 56,
  /** Thumb/handle radius. */
  THUMB_RADIUS: 26,
  /** Max distance thumb moves from center (stick travel). */
  THUMB_TRAVEL: 32,
} as const;

/**
 * Weapon Stats
 */
export const WEAPON_STATS = {
  pistol: {
    damage: 25,
    fireRate: 300, // ms
    cost: 0, // free starter weapon
    range: 300,
  },
  rifle: {
    damage: 35,
    fireRate: 150,
    cost: 200,
    range: 500,
  },
  shotgun: {
    damage: 80,
    fireRate: 800,
    cost: 150,
    range: 150,
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
 * Colors from official brand guidelines (Ethereum blue-purple, Solana green).
 */
export const TEAM_BRANDING = {
  ethereum: {
    name: "Ethereum",
    shortName: "ETH",
    /** Ethereum brand blue-purple (#627EEA) for in-game player tint and HUD. */
    colorHex: 0x627eea,
    colorCss: "#627EEA",
  },
  solana: {
    name: "Solana",
    shortName: "SOL",
    /** Solana brand green (#14F195) for in-game player tint and HUD. */
    colorHex: 0x14f195,
    colorCss: "#14F195",
  },
} as const;
