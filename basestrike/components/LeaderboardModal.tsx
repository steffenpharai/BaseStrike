"use client";

import { useEffect } from "react";

interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Placeholder leaderboard modal (slide-over or modal). Data source TBD.
 */
export function LeaderboardModal({ open, onClose }: LeaderboardModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-[var(--color-background-alt)] border-l border-white/10 shadow-xl flex flex-col safe-area-top safe-area-bottom"
        role="dialog"
        aria-modal="true"
        aria-labelledby="leaderboard-title"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 id="leaderboard-title" className="text-lg font-semibold text-white">
            Leaderboard
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-400 hover:text-white touch-target"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <p className="text-sm text-[var(--color-muted)]">
            Ranks and stats coming soon. Compete in Ranked to climb the ladder.
          </p>
          <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Top 3 (placeholder)</p>
            <ol className="mt-2 space-y-2 text-sm text-gray-300">
              <li>1. —</li>
              <li>2. —</li>
              <li>3. —</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
