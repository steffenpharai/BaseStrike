import type { PlayerAction, RoundState } from "./schemas";

export interface Player {
  id: string;
  fid?: number;
  displayName: string;
  team: "attackers" | "defenders";
  position: { x: number; y: number };
  health: number;
  alive: boolean;
  weapon: "pistol" | "rifle" | "shotgun";
  utilities: Array<"flashbang" | "smoke">;
  money: number;
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
    attackers: Array<{ x: number; y: number }>;
    defenders: Array<{ x: number; y: number }>;
  };
  walls: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export type { PlayerAction, RoundState };
