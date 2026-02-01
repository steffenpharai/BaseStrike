"use client";

import { useEffect, useRef, useState } from "react";
import { createGame, GAME_CONSTANTS } from "@/lib/game";
import type Phaser from "phaser";

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
  const [gameSize, setGameSize] = useState<{ width: number; height: number } | null>(null);

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
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [mounted, gameSize?.width, gameSize?.height, playerId, onAction]);

  if (!mounted) {
    return (
      <div className="w-full aspect-[4/3] bg-gray-800 animate-pulse flex items-center justify-center rounded-lg">
        <div className="text-gray-500">Loading game...</div>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="w-full aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center"
    >
      <div
        ref={containerRef}
        className="game-container rounded-lg overflow-hidden"
        style={{
          touchAction: "none",
          width: gameSize?.width ?? 0,
          height: gameSize?.height ?? 0,
        }}
      />
    </div>
  );
}
