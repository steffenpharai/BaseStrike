"use client";

import type { HudState } from "@/lib/game/types";
import { GAME_CONSTANTS } from "@/lib/game/constants";
import { TEAM_BRANDING } from "@/lib/game/constants";

interface MinimapProps {
  state: HudState | null;
}

const MAP_WIDTH = GAME_CONSTANTS.MAP_SIZE.width;
const MAP_HEIGHT = GAME_CONSTANTS.MAP_SIZE.height;
const MINIMAP_WIDTH = 128;
const MINIMAP_HEIGHT = 96;

function scaleX(x: number) {
  return (x / MAP_WIDTH) * MINIMAP_WIDTH;
}
function scaleY(y: number) {
  return (y / MAP_HEIGHT) * MINIMAP_HEIGHT;
}

/** Top-left minimap with player dots (ETH blue, SOL orange). */
export function Minimap({ state }: MinimapProps) {
  if (!state?.localPlayerPosition && !(state?.playerPositions?.length)) {
    return (
      <div
        className="pointer-events-none absolute left-2 top-2 z-10 overflow-hidden rounded-lg border border-white/15 bg-black/35 backdrop-blur-sm"
        style={{ width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT }}
        aria-hidden
      />
    );
  }

  const positions = state.playerPositions ?? [];
  const local = state.localPlayerPosition;

  return (
    <div
      className="pointer-events-none absolute left-2 top-2 z-10 overflow-hidden rounded-lg border border-white/15 bg-black/35 backdrop-blur-sm"
      style={{ width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT }}
      aria-label="Minimap"
    >
      <svg width={MINIMAP_WIDTH} height={MINIMAP_HEIGHT} className="block">
        {local && (
          <circle
            cx={scaleX(local.x)}
            cy={scaleY(local.y)}
            r={4}
            fill={TEAM_BRANDING.ethereum.colorCss}
            stroke="white"
            strokeWidth={1}
          />
        )}
        {positions.map((p) => (
          <circle
            key={p.id}
            cx={scaleX(p.x)}
            cy={scaleY(p.y)}
            r={3}
            fill={p.team === "ethereum" ? TEAM_BRANDING.ethereum.colorCss : TEAM_BRANDING.solana.colorCss}
          />
        ))}
      </svg>
    </div>
  );
}
