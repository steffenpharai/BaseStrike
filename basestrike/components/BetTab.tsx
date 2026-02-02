"use client";

import { useEffect, useState, useCallback } from "react";
import { MatchListSkeleton } from "./MatchListSkeleton";

type MatchStatus = "open" | "in_progress" | "finished";

interface MatchSummary {
  matchId: string;
  status: MatchStatus;
  ethereumCount: number;
  solanaCount: number;
  maxPerTeam: number;
  createdAt: number;
  finishedAt?: number;
}

function StatusBadge({ status }: { status: MatchStatus }) {
  const label = status === "open" ? "Open" : status === "in_progress" ? "Live" : "Finished";
  const className =
    status === "open"
      ? "bg-green-500/20 text-green-400"
      : status === "in_progress"
        ? "bg-red-500/20 text-red-400"
        : "bg-gray-500/20 text-gray-400";
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${className}`}>
      {label}
    </span>
  );
}

export function BetTab() {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMatches = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const res = await fetch("/api/matches");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setMatches(data.matches ?? []);
      setError(null);
    } catch {
      setError("Could not load matches");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const bettable = matches.filter((m) => m.status === "open" || m.status === "in_progress");

  return (
    <div className="flex-1 min-h-0 overflow-auto flex flex-col p-2">
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Bet
        </h2>
        <button
          type="button"
          onClick={() => fetchMatches(true)}
          disabled={refreshing}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-400 hover:text-[var(--color-primary)] active:bg-white/10 touch-target disabled:opacity-50"
          aria-label="Refresh matches"
        >
          <span className="text-lg" aria-hidden>{refreshing ? "⋯" : "↻"}</span>
        </button>
      </div>
      <p className="text-sm text-gray-400 mb-4 px-1">
        Pick ETH or SOL and place a wager. Winners get paid on Base when the match ends.
      </p>
      {loading && matches.length === 0 && (
        <MatchListSkeleton />
      )}
      {error && matches.length === 0 && (
        <div className="flex flex-col items-center py-12 gap-2">
          <span className="text-red-400">{error}</span>
          <button
            type="button"
            onClick={() => { setLoading(true); fetchMatches(true); }}
            className="min-h-[44px] px-4 rounded-lg bg-white/10 text-white touch-target"
          >
            Retry
          </button>
        </div>
      )}
      {!loading && (
        <div className="space-y-4">
          {bettable.length > 0 && (
            <ul className="space-y-2">
              {bettable.map((m) => (
                <li
                  key={m.matchId}
                  className="rounded-xl bg-[var(--color-background-alt)] border border-white/10 px-3 py-3 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <StatusBadge status={m.status} />
                    <span className="text-xs text-gray-500 truncate max-w-[140px]">{m.matchId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-400">ETH {m.ethereumCount}</span>
                    <span className="text-gray-500">vs</span>
                    <span className="text-sm text-orange-400">SOL {m.solanaCount}</span>
                  </div>
                  <button
                    type="button"
                    disabled
                    className="w-full min-h-[44px] rounded-xl bg-gray-600/50 text-gray-400 font-medium touch-target cursor-not-allowed"
                  >
                    Betting coming soon
                  </button>
                </li>
              ))}
            </ul>
          )}
          {bettable.length === 0 && (
            <div className="rounded-xl bg-[var(--color-background-alt)] border border-white/10 px-4 py-6 text-center">
              <p className="text-gray-400 text-sm mb-2">No open or live matches to bet on yet.</p>
              <p className="text-gray-500 text-xs">When Moltbots join, matches will appear here. Betting will be enabled soon.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
