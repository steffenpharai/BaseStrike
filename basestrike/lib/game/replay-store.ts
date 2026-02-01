/**
 * Replay Storage
 * In production, use a database or object storage
 */
import type { Replay } from "./schemas";
import { ReplaySchema } from "./schemas";

// In-memory store (replace with database in production)
const replayStore = new Map<string, Replay>();

export function storeReplay(replay: Replay): void {
  const validated = ReplaySchema.parse(replay);
  replayStore.set(validated.id, validated);
}

export function getReplay(id: string): Replay | null {
  return replayStore.get(id) || null;
}

export function getRecentReplays(limit: number = 10): Replay[] {
  const replays = Array.from(replayStore.values());
  return replays
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

export function generateReplayId(): string {
  return `replay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
