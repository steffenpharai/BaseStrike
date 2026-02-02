import { describe, it, expect } from "vitest";
import { snapshotToGameState, type StateSnapshot } from "./spectator-adapter";

describe("snapshotToGameState", () => {
  it("converts empty snapshot to GameState with empty players Map", () => {
    const snapshot: StateSnapshot = {
      matchId: "match_1",
      players: [],
      roundNumber: 1,
      roundState: {
        roundNumber: 1,
        phase: "active",
        ethereumAlive: 0,
        solanaAlive: 0,
        bombPlanted: false,
      },
    };
    const state = snapshotToGameState(snapshot);
    expect(state.matchId).toBe("match_1");
    expect(state.players).toBeDefined();
    expect(state.players?.size).toBe(0);
    expect(state.roundNumber).toBe(1);
    expect(state.roundState?.phase).toBe("active");
  });

  it("converts players array to Map and adds utilities default", () => {
    const snapshot: StateSnapshot = {
      matchId: "match_2",
      players: [
        {
          id: "agent_1",
          displayName: "Bot A",
          team: "ethereum",
          position: { x: 100, y: 200 },
          health: 80,
          alive: true,
          weapon: "rifle",
          ammoInMagazine: 25,
          money: 800,
        },
      ],
      roundNumber: 2,
    };
    const state = snapshotToGameState(snapshot);
    expect(state.players?.size).toBe(1);
    const p = state.players?.get("agent_1");
    expect(p).toBeDefined();
    expect(p?.displayName).toBe("Bot A");
    expect(p?.team).toBe("ethereum");
    expect(p?.position).toEqual({ x: 100, y: 200 });
    expect(p?.health).toBe(80);
    expect(p?.alive).toBe(true);
    expect(p?.weapon).toBe("rifle");
    expect(p?.ammoInMagazine).toBe(25);
    expect(p?.utilities).toEqual([]);
    expect(p?.money).toBe(800);
  });

  it("uses defaults for missing optional fields", () => {
    const snapshot: StateSnapshot = {
      matchId: "match_3",
      players: [{ id: "x", team: "solana", position: { x: 0, y: 0 } }],
    };
    const state = snapshotToGameState(snapshot);
    const p = state.players?.get("x");
    expect(p?.displayName).toBe("x");
    expect(p?.health).toBe(100);
    expect(p?.alive).toBe(true);
    expect(p?.weapon).toBe("rifle");
    expect(p?.ammoInMagazine).toBe(0);
    expect(p?.utilities).toEqual([]);
    expect(p?.money).toBe(0);
  });
});
