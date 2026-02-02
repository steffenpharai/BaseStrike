import type { PlayerAction, RoundState } from "./schemas";

/** Team 1 = Ethereum (defuses bomb), Team 2 = Solana (plants bomb). */
export type TeamId = "ethereum" | "solana";

export interface Player {
  id: string;
  fid?: number;
  displayName: string;
  team: TeamId;
  position: { x: number; y: number };
  health: number;
  alive: boolean;
  weapon: "pistol" | "rifle" | "shotgun";
  /** Current ammo in current magazine. */
  ammoInMagazine: number;
  utilities: Array<"flashbang" | "smoke">;
  money: number;
  /** Demo/spectator only: angle in radians for muzzle flash and tracer. */
  shootingAngle?: number;
}

export interface GameState {
  matchId: string;
  players: Map<string, Player>;
  roundNumber: number;
  roundState: RoundState;
  tickNumber: number;
  bombSite: "A" | "B" | null;
  bombPosition: { x: number; y: number } | null;
  defuseProgress: number;
}

export interface NetworkMessage {
  type: "sync" | "action" | "round_end" | "match_end";
  tick: number;
  data: unknown;
}

export interface SyncMessage extends NetworkMessage {
  type: "sync";
  data: {
    gameState: Partial<GameState>;
    players: Array<{
      id: string;
      position: { x: number; y: number };
      health: number;
      alive: boolean;
    }>;
  };
}

export interface ActionMessage extends NetworkMessage {
  type: "action";
  data: PlayerAction;
}

export interface MapConfig {
  width: number;
  height: number;
  siteA: { x: number; y: number; radius: number };
  siteB: { x: number; y: number; radius: number };
  spawns: {
    ethereum: Array<{ x: number; y: number }>;
    solana: Array<{ x: number; y: number }>;
  };
  walls: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

/** Snapshot of state for the React HUD overlay (FPS-style). Teams: Ethereum vs Solana. */
export interface HudState {
  roundNumber: number;
  phase: string;
  ethereumAlive: number;
  solanaAlive: number;
  bombPlanted: boolean;
  health: number;
  weapon: "pistol" | "rifle" | "shotgun";
  money: number;
  /** Current ammo in magazine (for WeaponHUD). */
  ammo: number;
  /** Max ammo per magazine (for WeaponHUD). */
  ammoMax: number;
  /** True while reloading (for WeaponHUD). */
  reloading?: boolean;
  /** Reload progress 0–1 while reloading (for progress bar). */
  reloadProgress?: number;
  /** Local player position for minimap. */
  localPlayerPosition?: { x: number; y: number };
  /** Other player positions for minimap (id, x, y, team). */
  playerPositions?: Array<{ id: string; x: number; y: number; team: TeamId }>;
}

export type { PlayerAction, RoundState };
