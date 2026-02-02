"use client";

import { div as MotionDiv } from "framer-motion/client";
import type { HudState } from "@/lib/game/types";
import { Minimap, Scorebar, HealthBar, WeaponHUD } from "@/components/HUD";

interface GameHudProps {
  state: HudState | null;
  /** If true, HUD is visible (game mounted and state received). */
  visible: boolean;
}

/** Industry-standard FPS-style HUD overlay. Composes Minimap, Scorebar, HealthBar, WeaponHUD at edges only. */
export function GameHud({ state, visible }: GameHudProps) {
  if (!visible) return null;

  return (
    <MotionDiv
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Minimap state={state} />
      <Scorebar state={state} />
      <HealthBar state={state} />
      <WeaponHUD state={state} />
    </MotionDiv>
  );
}
