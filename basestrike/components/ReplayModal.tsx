"use client";

import { useEffect, useState, useCallback } from "react";

interface ReplayData {
  replayId: string;
  finalScore: { ethereum: number; solana: number };
  players: Array<{ id: string; displayName: string; team: string }>;
}

interface ReplayModalProps {
  matchId: string;
  open: boolean;
  onClose: () => void;
}

/** Modal showing replay summary (final score, players) for a finished match. */
export function ReplayModal({ matchId, open, onClose }: ReplayModalProps) {
  const [data, setData] = useState<ReplayData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReplay = useCallback(async () => {
    if (!matchId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/matches/${encodeURIComponent(matchId)}/replay`);
      if (!res.ok) {
        if (res.status === 404) setError("Replay not available");
        else setError("Failed to load");
        return;
      }
      const json = await res.json();
      setData({
        replayId: json.replayId,
        finalScore: json.finalScore ?? { ethereum: 0, solana: 0 },
        players: json.players ?? [],
      });
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    if (open && matchId) fetchReplay();
  }, [open, matchId, fetchReplay]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/60" role="dialog" aria-modal="true" aria-label="Replay summary">
      <div className="w-full max-w-sm rounded-xl bg-[var(--color-background-alt)] border border-white/10 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Replay</h3>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-400 hover:text-white touch-target"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4">
          {loading && (
            <p className="text-sm text-gray-400">Loading…</p>
          )}
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          {data && !loading && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 py-2 rounded-lg bg-white/5">
                <span className="text-lg font-bold text-blue-400">ETH</span>
                <span className="text-2xl font-bold text-[var(--color-foreground)]">{data.finalScore.ethereum}</span>
                <span className="text-gray-500">–</span>
                <span className="text-2xl font-bold text-[var(--color-foreground)]">{data.finalScore.solana}</span>
                <span className="text-lg font-bold text-orange-400">SOL</span>
              </div>
              {data.players.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Players</h4>
                  <ul className="space-y-1">
                    {data.players.map((p) => (
                      <li key={p.id} className="text-sm flex justify-between">
                        <span className={p.team === "ethereum" ? "text-blue-400" : "text-orange-400"}>{p.displayName}</span>
                        <span className="text-gray-500">{p.team === "ethereum" ? "ETH" : "SOL"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
