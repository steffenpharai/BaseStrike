"use client";

import { useEffect, useState, useCallback } from "react";

const POLL_MS = 500;

interface SpectatorState {
  matchId: string;
  players: Array<{
    id: string;
    displayName: string;
    team: string;
    health: number;
    alive: boolean;
  }>;
  roundNumber: number;
  roundState?: {
    ethereumAlive: number;
    solanaAlive: number;
    phase: string;
  };
  finished?: boolean;
}

interface SpectatorViewProps {
  matchId: string;
  onClose: () => void;
}

/** Live spectator view: polls match state and shows score/round/players. */
export function SpectatorView({ matchId, onClose }: SpectatorViewProps) {
  const [state, setState] = useState<SpectatorState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/matches/${encodeURIComponent(matchId)}/state`);
      if (!res.ok) {
        if (res.status === 404) setError("Match not found");
        else setError("Failed to load");
        return;
      }
      const data = await res.json();
      setState({
        matchId: data.matchId,
        players: (data.players || []).map((p: { id: string; displayName?: string; team: string; health?: number; alive?: boolean }) => ({
          id: p.id,
          displayName: p.displayName || p.id,
          team: p.team,
          health: p.health ?? 100,
          alive: p.alive !== false,
        })),
        roundNumber: data.roundNumber ?? 1,
        roundState: data.roundState,
        finished: data.finished === true,
      });
      setError(null);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchState]);

  const ethAlive = state?.roundState?.ethereumAlive ?? 0;
  const solAlive = state?.roundState?.solanaAlive ?? 0;

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)]">
      <header className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-white/10 bg-[var(--color-background-alt)]">
        <h2 className="text-sm font-semibold truncate">Live: {matchId}</h2>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-white/20 bg-black/40 text-[var(--color-foreground)] touch-target"
          aria-label="Close"
        >
          ✕
        </button>
      </header>
      <main className="flex-1 min-h-0 overflow-auto p-4">
        {loading && !state && (
          <div className="flex items-center justify-center py-12">
            <span className="text-gray-400">Loading…</span>
          </div>
        )}
        {error && !state && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <span className="text-red-400">{error}</span>
            <button
              type="button"
              onClick={() => { setLoading(true); fetchState(); }}
              className="min-h-[44px] px-4 rounded-lg bg-white/10 text-white touch-target"
            >
              Retry
            </button>
          </div>
        )}
        {state && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4 py-2 rounded-xl bg-[var(--color-background-alt)]">
              <span className="text-lg font-bold text-blue-400">ETH</span>
              <span className="text-2xl font-bold text-white">
                {state.finished ? "—" : `${ethAlive} alive`}
              </span>
              <span className="text-gray-500">vs</span>
              <span className="text-2xl font-bold text-white">
                {state.finished ? "—" : `${solAlive} alive`}
              </span>
              <span className="text-lg font-bold text-orange-400">SOL</span>
            </div>
            <p className="text-center text-sm text-gray-400">
              Round {state.roundNumber}
              {state.roundState?.phase && ` · ${state.roundState.phase}`}
              {state.finished && " · Match ended"}
            </p>
            <section aria-label="Players">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Players
              </h3>
              <ul className="space-y-1">
                {state.players.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5 text-sm"
                  >
                    <span className={p.team === "ethereum" ? "text-blue-400" : "text-orange-400"}>
                      {p.displayName}
                    </span>
                    <span className="text-gray-400">
                      {p.alive ? `${p.health} HP` : "out"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
