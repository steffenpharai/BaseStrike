"use client";

/** Skeleton placeholders for match list loading (Base Featured: loading indicators). */
export function MatchListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 w-24 rounded bg-white/10" />
      <ul className="space-y-2">
        {[1, 2, 3].map((i) => (
          <li
            key={i}
            className="rounded-xl bg-[var(--color-background-alt)] border border-white/10 h-14"
            aria-hidden
          />
        ))}
      </ul>
    </div>
  );
}
