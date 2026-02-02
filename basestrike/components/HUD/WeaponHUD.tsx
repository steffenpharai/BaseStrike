"use client";

import { div as MotionDiv } from "framer-motion/client";
import type { HudState } from "@/lib/game/types";

interface WeaponHUDProps {
  state: HudState | null;
}

const WEAPON_LABELS: Record<HudState["weapon"], string> = {
  pistol: "Pistol",
  rifle: "Rifle",
  shotgun: "Shotgun",
};

/** Bottom-right: weapon name + ammo; Framer Motion reload progress bar when reloading. */
export function WeaponHUD({ state }: WeaponHUDProps) {
  if (!state) return null;

  const progress = state.reloadProgress ?? 0;

  return (
    <div className="pointer-events-none absolute bottom-4 right-4 z-10 flex flex-col items-end min-w-[80px]">
      <span className="text-sm font-semibold uppercase tracking-wider text-white/90">
        {WEAPON_LABELS[state.weapon]}
      </span>
      <span className="mt-0.5 text-xs tabular-nums text-gray-400">
        {state.reloading ? "Reloading…" : `${state.ammo ?? 0}/${state.ammoMax ?? 30}`}
      </span>
      {state.reloading && (
        <div className="mt-1.5 h-1 w-24 overflow-hidden rounded-full bg-black/60">
          <MotionDiv
            className="h-full rounded-full bg-[var(--color-primary)]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress }}
            transition={{ duration: 0.05 }}
            style={{ transformOrigin: "left" }}
          />
        </div>
      )}
    </div>
  );
}
