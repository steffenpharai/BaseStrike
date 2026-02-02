"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGameFlowStore } from "@/lib/stores/gameFlowStore";
import { LoadingScreen } from "./LoadingScreen";
import { TeamSelect } from "./TeamSelect";
import { Inventory } from "./Inventory";
import { QueueScreen } from "./QueueScreen";

const TRANSITION = { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const };

export default function FlowManager() {
  const stage = useGameFlowStore((s) => s.stage);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stage}
        initial={stage === "loading" ? { opacity: 0 } : { opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={stage === "loading" ? { opacity: 0 } : { opacity: 0, x: -24 }}
        transition={TRANSITION}
        className="absolute inset-0 z-0"
      >
        {stage === "loading" && <LoadingScreen />}
        {stage === "team" && <TeamSelect />}
        {stage === "inventory" && <Inventory />}
        {stage === "queue" && <QueueScreen />}
      </motion.div>
    </AnimatePresence>
  );
}
