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
