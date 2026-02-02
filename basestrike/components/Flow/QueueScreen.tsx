"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useGameFlowStore } from "@/lib/stores/gameFlowStore";

export function QueueScreen() {
  const {
    queuePlayers,
    queueTotal,
    queueCountdown,
    setStage,
    simulateQueue,
    setQueueCountdown,
    setQueuePlayers,
  } = useGameFlowStore();
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    cancelRef.current = simulateQueue(() => {
      cancelRef.current = null;
    });
    return () => {
      if (cancelRef.current) cancelRef.current();
    };
  }, [simulateQueue]);

  const handleCancel = () => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    setQueueCountdown(null);
    setQueuePlayers(0);
    setStage("inventory");
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0A0A0F] to-[#1A1A2E] p-6 safe-area-top safe-area-x">
      <motion.div
        className="flex flex-col items-center gap-8 max-w-sm w-full"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl font-bold text-white text-center">
          {queueCountdown !== null ? "Get ready!" : "Queueing…"}
        </h1>

        {/* Progress circle / player count */}
        <div className="relative flex items-center justify-center">
          <motion.div
            className="absolute h-32 w-32 rounded-full border-4 border-white/10"
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="absolute h-32 w-32 rounded-full border-4 border-transparent border-t-[var(--color-primary)]"
            initial={{ rotate: 0 }}
            animate={{
              rotate: queueCountdown !== null ? 0 : 360,
              transition: { duration: 2, repeat: Infinity, ease: "linear" },
            }}
          />
          <div className="relative z-10 flex flex-col items-center">
            {queueCountdown !== null ? (
              <motion.span
                key={queueCountdown}
                className="text-4xl font-bold text-white tabular-nums"
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {queueCountdown > 0 ? queueCountdown : "GO!"}
              </motion.span>
            ) : (
              <>
                <span className="text-3xl font-bold text-white tabular-nums">{queuePlayers}</span>
                <span className="text-sm text-[var(--color-muted)]">/ {queueTotal} players</span>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-[var(--color-muted)]">
          {queueCountdown !== null
            ? `Match starts in ${queueCountdown}…`
            : "Finding players…"}
        </p>

        {queueCountdown === null && (
          <motion.button
            type="button"
            onClick={handleCancel}
            className="min-h-[44px] px-6 rounded-xl border border-white/20 text-[var(--color-muted)] touch-target active:bg-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Cancel
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
