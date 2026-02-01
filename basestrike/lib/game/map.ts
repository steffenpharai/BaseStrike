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
    /** Team 1: Ethereum base = bomb site A (circle). */
    ethereum: [
      { x: 200, y: 200 },
      { x: 260, y: 200 },
      { x: 200, y: 260 },
      { x: 140, y: 200 },
      { x: 200, y: 140 },
    ],
    /** Team 2: Solana base = bomb site B (circle). */
    solana: [
      { x: 1080, y: 760 },
      { x: 1140, y: 760 },
      { x: 1080, y: 820 },
      { x: 1020, y: 760 },
      { x: 1080, y: 700 },
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

/**
 * Returns true if the line segment from a to b intersects any wall.
 * Used to block shots through walls.
 */
export function segmentIntersectsWall(
  a: { x: number; y: number },
  b: { x: number; y: number }
): boolean {
  for (const wall of DEFAULT_MAP.walls) {
    if (segmentIntersectsRect(a, b, wall)) return true;
  }
  return false;
}

/**
 * Returns the point where the segment from a to b first hits a wall (closest to a),
 * or null if no wall is hit. Used to clip bullet tracer visuals at the wall.
 */
export function getFirstWallHit(
  a: { x: number; y: number },
  b: { x: number; y: number }
): { x: number; y: number } | null {
  const t = getFirstWallHitParam(a, b);
  if (t == null) return null;
  return {
    x: a.x + t * (b.x - a.x),
    y: a.y + t * (b.y - a.y),
  };
}

/**
 * Returns the parameter t in [0, 1] where the segment from a to b first hits a wall,
 * or null if no wall is hit.
 */
export function getFirstWallHitParam(
  a: { x: number; y: number },
  b: { x: number; y: number }
): number | null {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1e-9) return null;

  let bestT: number | null = null;
  for (const wall of DEFAULT_MAP.walls) {
    const tLen = segmentRectEntryParam(a, b, len, wall);
    if (tLen == null || tLen < 0 || tLen > len) continue;
    const t = tLen / len;
    if (bestT == null || t < bestT) bestT = t;
  }
  return bestT;
}

/** Returns entry parameter t (in 0..len) for segment (a,b) vs rect, or null. */
function segmentRectEntryParam(
  a: { x: number; y: number },
  b: { x: number; y: number },
  len: number,
  rect: { x: number; y: number; width: number; height: number }
): number | null {
  const rx = rect.x;
  const ry = rect.y;
  const rw = rect.width;
  const rh = rect.height;
  const nx = (b.x - a.x) / len;
  const ny = (b.y - a.y) / len;

  let tMin = -Infinity;
  let tMax = Infinity;

  const tLeft = rx - a.x;
  const tRight = rx + rw - a.x;
  const tTop = ry - a.y;
  const tBottom = ry + rh - a.y;

  if (Math.abs(nx) > 1e-9) {
    const t1 = tLeft / nx;
    const t2 = tRight / nx;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  } else if (a.x < rx || a.x > rx + rw) return null;

  if (Math.abs(ny) > 1e-9) {
    const t1 = tTop / ny;
    const t2 = tBottom / ny;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  } else if (a.y < ry || a.y > ry + rh) return null;

  if (tMin > tMax) return null;
  if (tMax < 0 || tMin > len) return null;
  const entry = Math.max(0, tMin);
  return entry <= Math.min(len, tMax) ? entry : null;
}

/** Axis-aligned segment vs rectangle intersection. */
function segmentIntersectsRect(
  a: { x: number; y: number },
  b: { x: number; y: number },
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  const rx = rect.x;
  const ry = rect.y;
  const rw = rect.width;
  const rh = rect.height;
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y, b.y);

  // Segment AABB vs rect AABB
  if (maxX < rx || minX > rx + rw || maxY < ry || minY > ry + rh) return false;

  // Check if segment crosses any edge of the rect (parametric line segment vs 4 edges)
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) {
    return a.x >= rx && a.x <= rx + rw && a.y >= ry && a.y <= ry + rh;
  }
  const nx = dx / len;
  const ny = dy / len;

  const tLeft = rx - a.x;
  const tRight = rx + rw - a.x;
  const tTop = ry - a.y;
  const tBottom = ry + rh - a.y;

  let tMin = -Infinity;
  let tMax = Infinity;

  if (Math.abs(nx) > 1e-9) {
    const t1 = tLeft / nx;
    const t2 = tRight / nx;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  } else if (a.x < rx || a.x > rx + rw) return false;

  if (Math.abs(ny) > 1e-9) {
    const t1 = tTop / ny;
    const t2 = tBottom / ny;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  } else if (a.y < ry || a.y > ry + rh) return false;

  if (tMin > tMax) return false;
  // Intersection is valid if segment [0, len] overlaps [tMin, tMax]
  return tMax >= 0 && tMin <= len;
}
