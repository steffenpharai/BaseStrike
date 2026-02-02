"use client";

import { useEffect, useState, useCallback } from "react";
import { SpectatorView } from "./SpectatorView";
import { MatchListSkeleton } from "./MatchListSkeleton";
import { ReplayModal } from "./ReplayModal";

export type MatchStatus = "open" | "in_progress" | "finished";

export interface MatchSummary {
  matchId: string;
  status: MatchStatus;
  ethereumCount: number;
  solanaCount: number;
  maxPerTeam: number;
  createdAt: number;
  finishedAt?: number;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
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

export function WatchTab() {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spectatorMatchId, setSpectatorMatchId] = useState<string | null>(null);
  const [replayMatchId, setReplayMatchId] = useState<string | null>(null);
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
    const interval = setInterval(fetchMatches, 5000);
    return () => clearInterval(interval);
  }, [fetchMatches]);

  const live = matches.filter((m) => m.status === "in_progress");
  const open = matches.filter((m) => m.status === "open");
  const finished = matches.filter((m) => m.status === "finished");

  if (spectatorMatchId) {
    return (
      <SpectatorView
        matchId={spectatorMatchId}
        onClose={() => setSpectatorMatchId(null)}
      />
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto flex flex-col p-2">
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Watch
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
      {!loading && matches.length > 0 && (
        <p className="text-xs text-gray-500 mb-2 px-1" aria-live="polite">
          {live.length} live, {open.length} open, {finished.length} finished
        </p>
      )}
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
          {live.length > 0 && (
            <section aria-label="Live matches">
              <h3 className="text-xs font-semibold text-gray-500 mb-2">Live</h3>
              <ul className="space-y-2">
                {live.map((m) => (
                  <li
                    key={m.matchId}
                    className="rounded-xl bg-[var(--color-background-alt)] border border-white/10 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <StatusBadge status="in_progress" />
                        <span className="text-sm text-gray-300 truncate">
                          ETH {m.ethereumCount} vs SOL {m.solanaCount}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSpectatorMatchId(m.matchId)}
                        className="flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-[var(--color-primary)] text-white font-medium touch-target"
                        aria-label={`Watch match ${m.matchId}`}
                      >
                        Watch
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {open.length > 0 && (
            <section aria-label="Open matches">
              <h3 className="text-xs font-semibold text-gray-500 mb-2">Upcoming</h3>
              <ul className="space-y-2">
                {open.map((m) => (
                  <li
                    key={m.matchId}
                    className="rounded-xl bg-[var(--color-background-alt)] border border-white/10 px-3 py-2 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <StatusBadge status="open" />
                      <span className="text-sm text-gray-300 truncate">
                        {m.ethereumCount + m.solanaCount}/{m.maxPerTeam * 2} players
                      </span>
                      <span className="text-xs text-gray-500">{formatTime(m.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {finished.length > 0 && (
            <section aria-label="Finished matches">
              <h3 className="text-xs font-semibold text-gray-500 mb-2">Finished</h3>
              <ul className="space-y-2">
                {finished.map((m) => (
                  <li
                    key={m.matchId}
                    className="rounded-xl bg-[var(--color-background-alt)] border border-white/10 px-3 py-2 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <StatusBadge status="finished" />
                      <span className="text-sm text-gray-400 truncate">
                        {m.matchId}
                      </span>
                      {m.finishedAt != null && (
                        <span className="text-xs text-gray-500">{formatTime(m.finishedAt)}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setReplayMatchId(m.matchId)}
                      className="flex-shrink-0 min-h-[44px] px-3 flex items-center justify-center rounded-lg bg-white/10 text-gray-300 hover:text-white text-sm font-medium touch-target"
                      aria-label={`View replay for match ${m.matchId}`}
                    >
                      View replay
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <ReplayModal
            matchId={replayMatchId ?? ""}
            open={replayMatchId !== null}
            onClose={() => setReplayMatchId(null)}
          />
          {!loading && live.length === 0 && open.length === 0 && finished.length === 0 && (
            <p className="text-center text-gray-500 py-8">No matches yet. Matches will appear when Moltbots join.</p>
          )}
        </div>
      )}
    </div>
  );
}
