import { GAME_CONSTANTS } from "./constants";
import type { MapConfig } from "./types";

/**
 * Default map configuration - simple 2-site layout
 */
export const DEFAULT_MAP: MapConfig = {
  width: GAME_CONSTANTS.MAP_SIZE.width,
  height: GAME_CONSTANTS.MAP_SIZE.height,
  siteA: {
    x: 200,
    y: 200,
    radius: 100,
  },
  siteB: {
    x: 1080,
    y: 760,
    radius: 100,
  },
  spawns: {
    attackers: [
      { x: 640, y: 860 },
      { x: 600, y: 860 },
      { x: 680, y: 860 },
      { x: 560, y: 860 },
      { x: 720, y: 860 },
    ],
    defenders: [
      { x: 200, y: 100 },
      { x: 1080, y: 100 },
      { x: 200, y: 860 },
      { x: 1080, y: 860 },
      { x: 640, y: 100 },
    ],
  },
  walls: [
    // Center wall
    { x: 540, y: 380, width: 200, height: 200 },
    // Side walls
    { x: 0, y: 0, width: 20, height: 960 },
    { x: 1260, y: 0, width: 20, height: 960 },
    { x: 0, y: 0, width: 1280, height: 20 },
    { x: 0, y: 940, width: 1280, height: 20 },
    // Cover boxes near A
    { x: 150, y: 300, width: 60, height: 60 },
    { x: 280, y: 150, width: 60, height: 60 },
    // Cover boxes near B
    { x: 1000, y: 650, width: 60, height: 60 },
    { x: 1120, y: 800, width: 60, height: 60 },
  ],
};

export function isInSite(pos: { x: number; y: number }, site: "A" | "B"): boolean {
  const siteConfig = site === "A" ? DEFAULT_MAP.siteA : DEFAULT_MAP.siteB;
  const dx = pos.x - siteConfig.x;
  const dy = pos.y - siteConfig.y;
  return Math.sqrt(dx * dx + dy * dy) <= siteConfig.radius;
}

export function checkCollision(
  pos: { x: number; y: number },
  size: number = 20
): { x: number; y: number } {
  let newX = pos.x;
  let newY = pos.y;

  for (const wall of DEFAULT_MAP.walls) {
    if (
      newX + size > wall.x &&
      newX < wall.x + wall.width &&
      newY + size > wall.y &&
      newY < wall.y + wall.height
    ) {
      // Simple collision response - push player back
      const overlapX = Math.min(newX + size - wall.x, wall.x + wall.width - newX);
      const overlapY = Math.min(newY + size - wall.y, wall.y + wall.height - newY);

      if (overlapX < overlapY) {
        newX = newX + size > wall.x + wall.width / 2 ? wall.x + wall.width : wall.x - size;
      } else {
        newY = newY + size > wall.y + wall.height / 2 ? wall.y + wall.height : wall.y - size;
      }
    }
  }

  return { x: newX, y: newY };
}
