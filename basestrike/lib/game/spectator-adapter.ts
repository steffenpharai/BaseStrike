/**
 * Converts getStateSnapshot / API response shape to GameState for spectator rendering.
 * Used by SpectatorGameContainer to push server state into Phaser GameScene.
 */
import type { GameState, Player } from "./types";

export interface StateSnapshot {
  matchId: string;
  players?: Array<{
    id: string;
    displayName?: string;
    team: string;
    position: { x: number; y: number };
    health?: number;
    alive?: boolean;
    weapon?: string;
    ammoInMagazine?: number;
    money?: number;
  }>;
  roundNumber?: number;
  roundState?: GameState["roundState"];
  tickNumber?: number;
  bombSite?: "A" | "B" | null;
  bombPosition?: { x: number; y: number } | null;
  defuseProgress?: number;
}

/** Convert API snapshot (players array) to Partial<GameState> (players Map, defaults). */
export function snapshotToGameState(snapshot: StateSnapshot): Partial<GameState> {
  const players = new Map<string, Player>();
  const raw = snapshot.players ?? [];
  for (const p of raw) {
    const team = p.team === "ethereum" || p.team === "solana" ? p.team : "ethereum";
    const weapon =
      p.weapon === "pistol" || p.weapon === "rifle" || p.weapon === "shotgun"
        ? p.weapon
        : "rifle";
    const player: Player = {
      id: p.id,
      displayName: p.displayName ?? p.id,
      team,
      position: p.position ?? { x: 0, y: 0 },
      health: p.health ?? 100,
      alive: p.alive !== false,
      weapon,
      ammoInMagazine: p.ammoInMagazine ?? 0,
      utilities: [],
      money: p.money ?? 0,
    };
    players.set(p.id, player);
  }
  return {
    matchId: snapshot.matchId,
    players,
    roundNumber: snapshot.roundNumber ?? 1,
    roundState: snapshot.roundState ?? {
      roundNumber: 1,
      phase: "active",
      ethereumAlive: 0,
      solanaAlive: 0,
      bombPlanted: false,
    },
    tickNumber: snapshot.tickNumber ?? 0,
    bombSite: snapshot.bombSite ?? null,
    bombPosition: snapshot.bombPosition ?? null,
    defuseProgress: snapshot.defuseProgress ?? 0,
  };
}
