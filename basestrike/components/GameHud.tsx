"use client";

import type { HudState } from "@/lib/game/types";
import { TEAM_BRANDING } from "@/lib/game/constants";

interface GameHudProps {
  state: HudState | null;
  /** If true, HUD is visible (game mounted and state received). */
  visible: boolean;
}

const WEAPON_LABELS: Record<HudState["weapon"], string> = {
  pistol: "Pistol",
  rifle: "Rifle",
  shotgun: "Shotgun",
};

/** Industry-standard FPS-style HUD overlay (Overwatch/Fortnite inspired). Sits around the game canvas; pointer-events-none so input goes to game. */
export function GameHud({ state, visible }: GameHudProps) {
  if (!visible) return null;

  const s = state ?? defaultHudState();
  const healthPct = Math.max(0, Math.min(100, s.health));
  const healthColor =
    healthPct > 60 ? "bg-emerald-500" : healthPct > 30 ? "bg-amber-500" : "bg-red-500";

  return (
    <>
      {/* Top left — round, phase, team counts */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-1.5">
        <div className="rounded-lg bg-black/50 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
            Round {s.roundNumber}
          </span>
          <span className="ml-2 text-xs font-medium capitalize text-white/90">{s.phase}</span>
        </div>
        <div className="flex gap-2 rounded-lg bg-black/50 px-3 py-1.5 backdrop-blur-sm">
          <span
            className="text-xs font-bold"
            style={{ color: TEAM_BRANDING.ethereum.colorCss }}
          >
            {TEAM_BRANDING.ethereum.shortName} {s.ethereumAlive}
          </span>
          <span className="text-gray-500">|</span>
          <span
            className="text-xs font-bold"
            style={{ color: TEAM_BRANDING.solana.colorCss }}
          >
            {TEAM_BRANDING.solana.shortName} {s.solanaAlive}
          </span>
        </div>
        {s.bombPlanted && (
          <div className="rounded-lg bg-amber-500/20 px-3 py-1.5 backdrop-blur-sm border border-amber-500/50">
            <span className="text-xs font-bold uppercase text-amber-400">Bomb planted</span>
          </div>
        )}
      </div>

      {/* Top right — money */}
      <div className="pointer-events-none absolute right-3 top-3 z-10">
        <div className="rounded-lg bg-black/50 px-4 py-2 backdrop-blur-sm flex items-center gap-2">
          <span className="text-lg font-bold text-amber-400">$</span>
          <span className="text-lg font-bold tabular-nums text-white">{s.money}</span>
        </div>
      </div>

      {/* Bottom bar — health (left), weapon (center), optional right */}
      <div className="pointer-events-none absolute bottom-4 left-0 right-0 z-10 flex items-end justify-between px-4">
        {/* Health — large bar + number */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase text-gray-400">Health</span>
            <span className="text-lg font-bold tabular-nums text-white">{s.health}</span>
          </div>
          <div className="h-3 w-full max-w-[200px] overflow-hidden rounded-full bg-black/60 backdrop-blur-sm">
            <div
              className={`h-full rounded-full transition-all duration-150 ${healthColor}`}
              style={{ width: `${healthPct}%` }}
            />
          </div>
        </div>

        {/* Weapon — center */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex flex-col items-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-white/90">
            {WEAPON_LABELS[s.weapon]}
          </span>
          <span className="text-xs text-gray-400 mt-0.5">— / —</span>
        </div>

        {/* Right side placeholder (abilities slot) */}
        <div className="min-w-[80px]" />
      </div>
    </>
  );
}

function defaultHudState(): HudState {
  return {
    roundNumber: 1,
    phase: "active",
    ethereumAlive: 1,
    solanaAlive: 0,
    bombPlanted: false,
    health: 100,
    weapon: "rifle",
    money: 800,
  };
}
