"use client";

import dynamic from "next/dynamic";

const SpectatorGameContainer = dynamic(
  () =>
    import("@/components/SpectatorGameContainer").then((mod) => ({
      default: mod.SpectatorGameContainer,
    })),
  { ssr: false, loading: () => <SpectatorViewLoading /> }
);

function SpectatorViewLoading() {
  return (
    <div className="flex flex-1 min-h-0 items-center justify-center bg-[var(--color-background)]">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-12 w-12 rounded-full border-2 border-[var(--color-primary)]/40 border-t-[var(--color-primary)] animate-spin"
          aria-hidden
        />
        <span className="text-sm text-[var(--color-muted)]">Loading game…</span>
      </div>
    </div>
  );
}

interface SpectatorViewProps {
  matchId: string;
  onClose: () => void;
}

/** Live spectator view: shows the actual game (Phaser canvas) driven by server state. */
export function SpectatorView({ matchId, onClose }: SpectatorViewProps) {
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
      <main className="flex-1 min-h-0 flex flex-col">
        <SpectatorGameContainer matchId={matchId} />
      </main>
    </div>
  );
}
