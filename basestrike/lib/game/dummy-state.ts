/**
 * Generates a dummy GameState for the Watch tab demo when no live matches exist.
 * Waypoint patrol movement and periodic shooting so the demo feels alive.
 */
import type { GameState, Player } from "./types";
import { DEFAULT_MAP } from "./map";
import { WEAPON_STATS } from "./constants";
import { checkCollision } from "./map";

const DEMO_ETH_NAMES = ["ETH Alpha", "ETH Bravo"];
const DEMO_SOL_NAMES = ["SOL Alpha", "SOL Bravo"];

/** Patrol: move between spawn and a point toward center. Period in ms. */
const PATROL_PERIOD_MS = 5000;
/** How far toward center (0–1). */
const PATROL_AMOUNT = 0.55;

/** Mid points toward center (avoid center wall). */
const ETH_MID = { x: 380, y: 320 };
const SOL_MID = { x: 900, y: 640 };

/** Shooting: one player "fires" for this many ms per cycle. */
const SHOT_DURATION_MS = 180;
const SHOT_CYCLE_MS = 700;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPos(
  from: { x: number; y: number },
  to: { x: number; y: number },
  t: number
): { x: number; y: number } {
  return {
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
  };
}

/** Smooth 0–1 phase for patrol (out and back). */
function patrolPhase(t: number): number {
  const x = (t / PATROL_PERIOD_MS) * Math.PI * 2;
  return 0.5 + 0.5 * Math.sin(x);
}

/** Which player is shooting this frame (0–3), or -1. */
function shootingPlayerIndex(t: number): number {
  const cycle = Math.floor(t / SHOT_CYCLE_MS) % 4;
  const phaseInCycle = t % SHOT_CYCLE_MS;
  if (phaseInCycle < SHOT_DURATION_MS) return cycle;
  return -1;
}

/** Angle from (from) toward (to). */
function angleToward(
  from: { x: number; y: number },
  to: { x: number; y: number }
): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

/**
 * Returns a Partial<GameState> for the demo: 2 ETH and 2 SOL with patrol movement
 * and periodic muzzle flashes / tracers.
 */
export function getDummyGameState(t: number): Partial<GameState> {
  const players = new Map<string, Player>();
  const shootingIndex = shootingPlayerIndex(t);
  const center = { x: 640, y: 480 };

  const ethSpawns = DEFAULT_MAP.spawns.ethereum.slice(0, 2);
  const solSpawns = DEFAULT_MAP.spawns.solana.slice(0, 2);

  ethSpawns.forEach((spawn, i) => {
    const id = `demo-eth-${i}`;
    const phase = patrolPhase(t + i * 800);
    const raw = lerpPos(spawn, ETH_MID, phase * PATROL_AMOUNT);
    const position = checkCollision(raw);

    const isShooting = shootingIndex === i;
    const shootingAngle = isShooting
      ? angleToward(position, center)
      : undefined;

    players.set(id, {
      id,
      displayName: DEMO_ETH_NAMES[i] ?? `ETH ${i + 1}`,
      team: "ethereum",
      position,
      health: 100,
      alive: true,
      weapon: "rifle",
      ammoInMagazine: WEAPON_STATS.rifle.magazineSize,
      utilities: [],
      money: 800,
      shootingAngle,
    });
  });

  solSpawns.forEach((spawn, i) => {
    const id = `demo-sol-${i}`;
    const phase = patrolPhase(t + (i + 2) * 800);
    const raw = lerpPos(spawn, SOL_MID, phase * PATROL_AMOUNT);
    const position = checkCollision(raw);

    const isShooting = shootingIndex === i + 2;
    const shootingAngle = isShooting
      ? angleToward(position, center)
      : undefined;

    players.set(id, {
      id,
      displayName: DEMO_SOL_NAMES[i] ?? `SOL ${i + 1}`,
      team: "solana",
      position,
      health: 100,
      alive: true,
      weapon: "rifle",
      ammoInMagazine: WEAPON_STATS.rifle.magazineSize,
      utilities: [],
      money: 800,
      shootingAngle,
    });
  });

  return {
    matchId: "demo",
    players,
    roundNumber: 1,
    roundState: {
      roundNumber: 1,
      phase: "active",
      ethereumAlive: 2,
      solanaAlive: 2,
      bombPlanted: false,
    },
    tickNumber: Math.floor(t / 100),
    bombSite: null,
    bombPosition: null,
    defuseProgress: 0,
  };
}
