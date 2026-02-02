"use client";

import { useEffect, useRef, useState } from "react";
import { createGame, GAME_CONSTANTS, snapshotToGameState } from "@/lib/game";
import type { GameState } from "@/lib/game/types";
import type Phaser from "phaser";

const POLL_MS = 400;
const GAME_WIDTH = GAME_CONSTANTS.MAP_SIZE.width;
const GAME_HEIGHT = GAME_CONSTANTS.MAP_SIZE.height;
const GRID_STEP = GAME_CONSTANTS.GRID_SIZE;
const DISPLAY_UNITS_W = GAME_WIDTH / GRID_STEP;
const DISPLAY_UNITS_H = GAME_HEIGHT / GRID_STEP;

interface SpectatorGameContainerProps {
  matchId: string;
}

/** Renders the live game (Phaser) in spectator mode; polls server state and pushes to scene. */
export function SpectatorGameContainer({ matchId }: SpectatorGameContainerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [mounted, setMounted] = useState(false);
  const [gameSize, setGameSize] = useState<{ width: number; height: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hud, setHud] = useState<{ roundNumber: number; ethAlive: number; solAlive: number; phase: string; finished: boolean } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !wrapperRef.current) return;
    const wrapper = wrapperRef.current;
    const updateSize = () => {
      const w = wrapper.clientWidth;
      const h = wrapper.clientHeight;
      if (w <= 0 || h <= 0) return;
      const m = Math.max(1, Math.min(Math.floor(w / DISPLAY_UNITS_W), Math.floor(h / DISPLAY_UNITS_H)));
      setGameSize({ width: DISPLAY_UNITS_W * m, height: DISPLAY_UNITS_H * m });
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !containerRef.current || !gameSize || gameSize.width <= 0 || gameSize.height <= 0 || !matchId)
      return;

    const game = createGame(containerRef.current, {
      playerId: "spectator",
      onAction: () => {},
      spectator: true,
    });
    gameRef.current = game;

    const fetchAndPushState = async () => {
      try {
        const res = await fetch(`/api/matches/${encodeURIComponent(matchId)}/state`);
        if (!res.ok) {
          if (res.status === 404) setError("Match ended or not found");
          return;
        }
        const data = await res.json();
        setError(null);
        const rs = data.roundState ?? {};
        setHud({
          roundNumber: data.roundNumber ?? 1,
          ethAlive: rs.ethereumAlive ?? 0,
          solAlive: rs.solanaAlive ?? 0,
          phase: rs.phase ?? "active",
          finished: data.finished === true,
        });
        const scene = game.scene.getScene("GameScene") as unknown as
          | { updateGameState: (state: Partial<GameState>) => void }
          | undefined;
        if (scene?.updateGameState) {
          const state = snapshotToGameState(data);
          scene.updateGameState(state);
        }
      } catch {
        setError("Connection error");
      }
    };

    fetchAndPushState();
    const interval = setInterval(fetchAndPushState, POLL_MS);

    return () => {
      clearInterval(interval);
      game.destroy(true);
      gameRef.current = null;
    };
  }, [mounted, gameSize, matchId]);

  if (!mounted) {
    return (
      <div
        className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-4 rounded-lg bg-[var(--color-background-alt)]"
        aria-busy
        aria-label="Loading spectator view"
      >
        <div
          className="h-12 w-12 shrink-0 rounded-full border-2 border-[var(--color-primary)]/40 border-t-[var(--color-primary)] animate-spin"
          aria-hidden
        />
        <span className="text-sm text-[var(--color-muted)]">Loading game…</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-0 bg-[var(--color-background)] rounded-lg overflow-hidden flex flex-col relative">
      {hud && (
        <div className="flex-shrink-0 flex items-center justify-center gap-2 py-1.5 px-2 bg-[var(--color-background-alt)]/90 border-b border-white/10 text-sm">
          <span className="text-[var(--color-muted)]">Round {hud.roundNumber}</span>
          <span className="text-gray-500">·</span>
          <span className="text-blue-400 font-medium">ETH {hud.ethAlive}</span>
          <span className="text-gray-500">vs</span>
          <span className="text-orange-400 font-medium">SOL {hud.solAlive}</span>
          {hud.finished && <span className="text-[var(--color-muted)] ml-1">· Ended</span>}
        </div>
      )}
      {error && (
        <div className="absolute top-2 left-2 right-2 z-20 py-2 px-3 rounded-lg bg-red-900/80 text-red-100 text-sm text-center">
          {error}
        </div>
      )}
      <div ref={wrapperRef} className="flex-1 min-h-0 flex items-center justify-center">
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            width: gameSize?.width ?? 0,
            height: gameSize?.height ?? 0,
          }}
        >
          <div
            ref={containerRef}
            className="game-container absolute inset-0 rounded-lg overflow-hidden"
            style={{ touchAction: "none" }}
          />
        </div>
      </div>
    </div>
  );
}
