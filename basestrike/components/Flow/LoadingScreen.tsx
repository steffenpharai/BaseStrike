"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BaseRiftLogo } from "@/components/BaseRiftLogo";
import { useGameFlowStore } from "@/lib/stores/gameFlowStore";

const LOADING_TIPS = [
  "Tap to shoot · Joystick to move",
  "Capture sites A and B to win",
  "Claim $800 on victory",
  "ETH vs SOL — pick your side",
  "Stay in cover, reload when safe",
];

const MIN_LOADING_MS = 1000;

export function LoadingScreen() {
  const setStage = useGameFlowStore((s) => s.setStage);
  const setLoadingComplete = useGameFlowStore((s) => s.setLoadingComplete);
  const loadingMinMs = useGameFlowStore((s) => s.loadingMinMs);
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const duration = Math.max(loadingMinMs, MIN_LOADING_MS);
    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(1, elapsed / duration));
    }, 50);

    // Do not clear this timeout on cleanup: Strict Mode double-mount clears it before it fires.
    // Let it fire so the store always advances to "team" after duration.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- intentionally not cleared
    const timeout = setTimeout(() => {
      setLoadingComplete(true);
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
      setStage("team");
    }, duration);

    return () => {
      clearInterval(interval);
      // Intentionally do not clearTimeout(timeout) so transition runs even after unmount
    };
  }, [setStage, setLoadingComplete, loadingMinMs]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % LOADING_TIPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0A0A0F] to-[#1A1A2E] p-6 safe-area-top safe-area-x">
      {/* Kenney-style particle bg: subtle dots */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-[var(--color-primary)]"
            style={{
              left: `${(i * 7) % 100}%`,
              top: `${(i * 11) % 100}%`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="baserift-logo-mark-idle">
          <BaseRiftLogo variant="full" animated />
        </div>

        {/* Progress bar */}
        <div className="w-full">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-[var(--color-primary)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.15 }}
            />
          </div>
          <p className="mt-2 text-center text-xs text-[var(--color-muted)]">
            Loading assets…
          </p>
        </div>

        {/* Spinner */}
        <div
          className="h-10 w-10 shrink-0 rounded-full border-2 border-[var(--color-primary)]/40 border-t-[var(--color-primary)] animate-spin"
          aria-hidden
        />

        {/* Rotating tips */}
        <motion.p
          key={tipIndex}
          className="min-h-[2.5rem] text-center text-sm text-[var(--color-muted)]"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3 }}
        >
          {LOADING_TIPS[tipIndex]}
        </motion.p>
      </motion.div>
    </div>
  );
}
