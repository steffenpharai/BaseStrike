import { create } from "zustand";

export type FlowStage = "loading" | "team" | "inventory" | "queue" | "game";

export type TeamId = "ETH" | "SOL";
/** Game uses "ethereum" | "solana"; map ETH → ethereum, SOL → solana. */
export function teamToGameTeam(team: TeamId): "ethereum" | "solana" {
  return team === "ETH" ? "ethereum" : "solana";
}

export type WeaponSlot = "pistol" | "rifle" | "shotgun";

export interface LoadoutState {
  primary: WeaponSlot;
  secondary: WeaponSlot | null;
  melee?: boolean;
}

const DEFAULT_LOADOUT: LoadoutState = {
  primary: "rifle",
  secondary: null,
  melee: true,
};

export interface GameFlowState {
  stage: FlowStage;
  team: TeamId | null;
  loadout: LoadoutState;
  queuePlayers: number;
  queueTotal: number;
  queueCountdown: number | null;
  /** Min loading duration (ms) before allowing transition to team. */
  loadingMinMs: number;
  /** Whether loading has completed (assets ready). */
  loadingComplete: boolean;
}

export interface GameFlowActions {
  setStage: (stage: FlowStage) => void;
  pickTeam: (team: TeamId) => void;
  updateLoadout: (loadout: Partial<LoadoutState>) => void;
  setQueuePlayers: (n: number) => void;
  setQueueTotal: (n: number) => void;
  setQueueCountdown: (n: number | null) => void;
  setLoadingComplete: (complete: boolean) => void;
  /** Reset flow to team select (e.g. after game end / rematch). */
  resetToTeamSelect: () => void;
  /** Start simulated queue: increment players over 2–10s then run countdown. */
  simulateQueue: (onMatchReady: () => void) => () => void;
}

const initialState: GameFlowState = {
  stage: "loading",
  team: null,
  loadout: DEFAULT_LOADOUT,
  queuePlayers: 0,
  queueTotal: 32,
  queueCountdown: null,
  loadingMinMs: 1500,
  loadingComplete: false,
};

export const useGameFlowStore = create<GameFlowState & GameFlowActions>((set, get) => ({
  ...initialState,

  setStage: (stage) => set({ stage }),

  pickTeam: (team) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
    set({ team });
  },

  updateLoadout: (partial) =>
    set((s) => ({ loadout: { ...s.loadout, ...partial } })),

  setQueuePlayers: (queuePlayers) => set({ queuePlayers }),
  setQueueTotal: (queueTotal) => set({ queueTotal }),
  setQueueCountdown: (queueCountdown) => set({ queueCountdown }),

  setLoadingComplete: (loadingComplete) => set({ loadingComplete }),

  resetToTeamSelect: () =>
    set({
      stage: "team",
      queuePlayers: 0,
      queueCountdown: null,
    }),

  simulateQueue: (onMatchReady) => {
    const total = get().queueTotal;
    const durationMs = 2000 + Math.random() * 8000;
    const stepMs = 200;
    let steps = 0;
    const maxSteps = Math.ceil(durationMs / stepMs);
    let countInterval: ReturnType<typeof setInterval> | null = null;
    const interval = setInterval(() => {
      steps += 1;
      const players = Math.min(total, Math.floor((steps / maxSteps) * (total * 0.6)) + 1);
      set({ queuePlayers: players });
      if (steps >= maxSteps) {
        clearInterval(interval);
        set({ queuePlayers: total });
        let countdown = 5;
        set({ queueCountdown: countdown });
        countInterval = setInterval(() => {
          countdown -= 1;
          set({ queueCountdown: countdown > 0 ? countdown : null });
          if (countdown <= 0) {
            if (countInterval) clearInterval(countInterval);
            if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([50, 30, 50]);
            set({ stage: "game" });
            onMatchReady();
          }
        }, 1000);
      }
    }, stepMs);
    return () => {
      clearInterval(interval);
      if (countInterval) clearInterval(countInterval);
    };
  },
}));
