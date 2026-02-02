/**
 * Replay Storage
 * In production, use a database or object storage
 */
import type { Replay } from "./schemas";
import { ReplaySchema } from "./schemas";

// In-memory store (replace with database in production)
const replayStore = new Map<string, Replay>();
const replayByMatchId = new Map<string, string>(); // matchId -> replayId

export function storeReplay(replay: Replay): void {
  const validated = ReplaySchema.parse(replay);
  replayStore.set(validated.id, validated);
  if (validated.matchId) {
    replayByMatchId.set(validated.matchId, validated.id);
  }
}

export function getReplayByMatchId(matchId: string): Replay | null {
  const replayId = replayByMatchId.get(matchId);
  if (!replayId) return null;
  return replayStore.get(replayId) || null;
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
