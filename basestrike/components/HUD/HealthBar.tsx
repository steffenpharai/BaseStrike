"use client";

import type { HudState } from "@/lib/game/types";

interface HealthBarProps {
  state: HudState | null;
}

/** Bottom-left: health bar (green→amber→red) + number. */
export function HealthBar({ state }: HealthBarProps) {
  if (!state) return null;

  const pct = Math.max(0, Math.min(100, state.health));
  const colorClass =
    pct > 60 ? "bg-emerald-500" : pct > 30 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex flex-col gap-1 min-w-[120px]">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase text-gray-400">Health</span>
        <span className="text-lg font-bold tabular-nums text-white">{state.health}</span>
      </div>
      <div className="h-3 w-full max-w-[180px] overflow-hidden rounded-full bg-black/60 backdrop-blur-sm">
        <div
          className={`h-full rounded-full transition-all duration-150 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
