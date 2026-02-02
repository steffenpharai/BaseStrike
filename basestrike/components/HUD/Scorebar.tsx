"use client";

import type { HudState } from "@/lib/game/types";
import { TEAM_BRANDING } from "@/lib/game/constants";

interface ScorebarProps {
  state: HudState | null;
}

/** Top-center: Round, money, ETH–SOL score. */
export function Scorebar({ state }: ScorebarProps) {
  if (!state) return null;

  return (
    <div className="pointer-events-none absolute left-1/2 top-2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5">
      <div className="rounded-lg bg-black/50 px-3 py-1.5 backdrop-blur-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
          Round {state.roundNumber}
        </span>
        <span className="ml-2 text-xs font-medium capitalize text-white/90">{state.phase}</span>
      </div>
      <div className="flex items-center gap-3 rounded-lg bg-black/50 px-4 py-2 backdrop-blur-sm">
        <span className="text-base font-bold tabular-nums text-amber-400">${state.money}</span>
        <span className="text-gray-500">|</span>
        <span
          className="text-sm font-bold"
          style={{ color: TEAM_BRANDING.ethereum.colorCss }}
        >
          {TEAM_BRANDING.ethereum.shortName} {state.ethereumAlive}
        </span>
        <span className="text-gray-500">–</span>
        <span
          className="text-sm font-bold"
          style={{ color: TEAM_BRANDING.solana.colorCss }}
        >
          {TEAM_BRANDING.solana.shortName} {state.solanaAlive}
        </span>
      </div>
      {state.bombPlanted && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/20 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-xs font-bold uppercase text-amber-400">Bomb planted</span>
        </div>
      )}
    </div>
  );
}
