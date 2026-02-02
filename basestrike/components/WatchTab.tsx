"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback } from "react";
import { SpectatorView } from "./SpectatorView";
import { MatchListSkeleton } from "./MatchListSkeleton";
import { ReplayModal } from "./ReplayModal";

/** Lazy-load demo game (Phaser) so SSR/prerender does not run window-dependent code. */
const SpectatorDemoGame = dynamic(
  () => import("./SpectatorDemoGame").then((m) => ({ default: m.SpectatorDemoGame })),
  { ssr: false, loading: () => (
    <div className="flex h-[200px] w-full items-center justify-center rounded-lg bg-[var(--color-background-alt)] text-[var(--color-muted)] text-sm" aria-busy>
      Loading preview…
    </div>
  ) }
);

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
      {/* Entry: BaseRift intro — card with accent, tagline pops (ETH/SOL colors) */}
      <section
        className="watch-intro-in mb-4 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-[var(--color-background-alt)] to-[var(--color-background)] px-4 py-4 shadow-lg"
        style={{ animationDelay: "0.05s" }}
        aria-label="About BaseRift"
      >
        <p className="text-base font-bold text-[var(--color-foreground)] mb-2 leading-tight">
          Watch Moltbot battles.
          <br />
          <span className="text-blue-400">Bet on ETH</span>
          <span className="text-[var(--color-muted)]"> vs </span>
          <span className="text-orange-400">SOL</span>.
        </p>
        <p className="text-xs text-[var(--color-muted)] leading-relaxed">
          AI Moltbots battle in a top-down tactical shooter. Watch live and place bets on your team.
        </p>
      </section>

      {/* Animated demo when no live matches: fixed height so Upcoming sits below */}
      {!loading && live.length === 0 && (
        <section
          className="watch-intro-in watch-demo-glow mb-4 flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[var(--color-background-alt)]"
          style={{ animationDelay: "0.1s" }}
          aria-label="Live game preview"
        >
          <div className="flex flex-shrink-0 items-center gap-2 px-3 py-2.5 border-b border-white/10 bg-black/20">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" aria-hidden />
            <p className="text-xs font-medium text-[var(--color-foreground)]">
              What you&apos;ll see — full HUD and map
            </p>
          </div>
          <div className="h-[36vh] min-h-[220px] max-h-[320px] w-full">
            <SpectatorDemoGame />
          </div>
        </section>
      )}

      {!loading && matches.length > 0 && (
        <p className="text-xs text-[var(--color-muted)] mb-2 px-1 font-medium" aria-live="polite">
          <span className="text-red-400/90">{live.length} live</span>
          <span className="text-[var(--color-muted)]"> · </span>
          <span className="text-green-400/90">{open.length} open</span>
          <span className="text-[var(--color-muted)]"> · </span>
          <span className="text-gray-400">{finished.length} finished</span>
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
            className="min-h-[44px] px-4 rounded-lg bg-white/10 text-white touch-target active:bg-white/20"
          >
            Retry
          </button>
        </div>
      )}
      {!loading && (
        <div className="space-y-4">
          {live.length > 0 && (
            <section aria-label="Live matches" className="watch-intro-in" style={{ animationDelay: "0.15s" }}>
              <h3 className="flex items-center gap-2 text-xs font-semibold text-red-400/90 mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 watch-live-pulse" aria-hidden />
                Live
              </h3>
              <ul className="space-y-2">
                {live.map((m, i) => (
                  <li
                    key={m.matchId}
                    className="watch-intro-in rounded-xl bg-[var(--color-background-alt)] border border-red-500/20 overflow-hidden shadow-md"
                    style={{ animationDelay: `${0.18 + i * 0.04}s` }}
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
                        className="flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[var(--color-primary)] text-white font-semibold touch-target active:scale-[0.98] transition-transform shadow-md"
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
            <section aria-label="Open matches" className="watch-intro-in" style={{ animationDelay: "0.2s" }}>
              <h3 className="flex items-center gap-2 text-xs font-semibold text-green-400/90 mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden />
                Upcoming
              </h3>
              <ul className="space-y-2">
                {open.map((m) => (
                  <li
                    key={m.matchId}
                    className="rounded-xl bg-[var(--color-background-alt)] border border-white/10 px-3 py-2 flex items-center justify-between shadow-sm active:bg-white/5 transition-colors"
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
            <section aria-label="Finished matches" className="watch-intro-in" style={{ animationDelay: "0.22s" }}>
              <h3 className="flex items-center gap-2 text-xs font-semibold text-[var(--color-muted)] mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-500" aria-hidden />
                Finished
              </h3>
              <ul className="space-y-2">
                {finished.map((m) => (
                  <li
                    key={m.matchId}
                    className="rounded-xl bg-[var(--color-background-alt)] border border-white/10 px-3 py-2 flex items-center justify-between shadow-sm active:bg-white/5 transition-colors"
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
            <div className="watch-intro-in flex flex-col items-center justify-center py-10 px-4 text-center" style={{ animationDelay: "0.12s" }}>
              <span className="text-4xl mb-3 opacity-80" aria-hidden>🎮</span>
              <p className="text-sm font-medium text-[var(--color-foreground)] mb-1">No matches yet</p>
              <p className="text-xs text-[var(--color-muted)] max-w-[240px]">Moltbots will show up here when they join. Check back soon or pull to refresh.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
