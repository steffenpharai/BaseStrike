"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { div as MotionDiv } from "framer-motion/client";
import { createGame, GAME_CONSTANTS, type FireTrigger } from "@/lib/game";
import type { HudState } from "@/lib/game/types";
import type Phaser from "phaser";
import { GameHud } from "@/components/GameHud";

/** Game size (1280×960); grid is 80px so scale must be m/80 for grid to align to pixels. */
const GAME_WIDTH = GAME_CONSTANTS.MAP_SIZE.width;
const GAME_HEIGHT = GAME_CONSTANTS.MAP_SIZE.height;
const GRID_STEP = GAME_CONSTANTS.GRID_SIZE;
/** Display size = (GAME_WIDTH/GRID_STEP)*m × (GAME_HEIGHT/GRID_STEP)*m = 16m × 12m so each grid cell is m pixels. */
const DISPLAY_UNITS_W = GAME_WIDTH / GRID_STEP;
const DISPLAY_UNITS_H = GAME_HEIGHT / GRID_STEP;

interface GameContainerProps {
  playerId: string;
  matchId: string;
  onAction: (action: unknown) => void;
}

export function GameContainer({ playerId, matchId: _matchId, onAction }: GameContainerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [mounted, setMounted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameSize, setGameSize] = useState<{ width: number; height: number } | null>(null);
  const [hudState, setHudState] = useState<HudState | null>(null);
  const onHudState = useCallback((state: HudState) => setHudState(state), []);
  const fireTriggerRef = useRef<FireTrigger | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Size the game container so scale = m/80 (integer grid alignment); measure wrapper and set 16m × 12m
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
    if (!mounted || !containerRef.current || !gameSize || gameSize.width <= 0 || gameSize.height <= 0) return;

    gameRef.current = createGame(containerRef.current, {
      playerId,
      onAction,
      onHudState,
      fireTriggerRef,
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [mounted, gameSize, playerId, onAction, onHudState]);

  if (!mounted) {
    return (
      <div
        className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-4 rounded-lg bg-[var(--color-background-alt)]"
        aria-busy
        aria-label="Loading game"
      >
        <div
          className="h-12 w-12 shrink-0 rounded-full border-2 border-[var(--color-primary)]/40 border-t-[var(--color-primary)] animate-spin"
          aria-hidden
        />
        <div className="h-3 w-48 rounded-full bg-white/10 animate-pulse" />
        <span className="text-sm text-[var(--color-muted)]">Loading game…</span>
      </div>
    );
  }

  return (
    <MotionDiv
      ref={wrapperRef}
      className="w-full h-full min-h-0 bg-[var(--color-background)] rounded-lg overflow-hidden flex items-center justify-center relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
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
        <GameHud state={hudState} visible={mounted && !!gameSize && !!hudState && !paused} />
        {/* Pause button (top-right). */}
        <button
          type="button"
          aria-label={paused ? "Resume" : "Pause"}
          className="absolute top-2 right-2 z-20 flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-black/40 text-white/90 touch-target"
          onClick={() => setPaused((p) => !p)}
        >
          <span className="text-lg font-bold" aria-hidden>{paused ? "▶" : "⏸"}</span>
        </button>
        {/* Paused overlay (esc-like). */}
        {paused && (
          <div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="paused-title"
          >
            <h2 id="paused-title" className="text-xl font-semibold text-white">
              Paused
            </h2>
            <button
              type="button"
              onClick={() => setPaused(false)}
              className="min-h-[48px] px-6 rounded-xl bg-[var(--color-primary)] text-white font-semibold touch-target"
            >
              Resume
            </button>
          </div>
        )}
        {/* Optional fire button (60px, bottom-right); pointer-events so it receives taps. */}
        <button
          type="button"
          aria-label="Fire"
          className="absolute bottom-4 right-4 z-20 flex h-[60px] w-[60px] items-center justify-center rounded-full border-2 border-white/30 bg-black/50 backdrop-blur-sm text-white/90 touch-target active:scale-95 active:bg-black/70 transition-transform"
          style={{ minWidth: 60, minHeight: 60 }}
          onPointerDown={(e) => {
            e.preventDefault();
            fireTriggerRef.current?.shoot();
          }}
        >
          <span className="text-xl font-bold" aria-hidden>🔥</span>
        </button>
      </div>
    </MotionDiv>
  );
}
