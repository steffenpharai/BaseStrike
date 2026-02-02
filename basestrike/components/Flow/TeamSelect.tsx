"use client";

import { motion } from "framer-motion";
import { useGameFlowStore, type TeamId } from "@/lib/stores/gameFlowStore";

const TEAMS: { id: TeamId; name: string; tagline: string; lore: string; color: string; bgGradient: string; borderGlow: string }[] = [
  {
    id: "ETH",
    name: "Ethereum",
    tagline: "Secure the chain",
    lore: "Defenders. Hold sites, defuse, protect the network.",
    color: "text-[#0F6CDF]",
    bgGradient: "from-[#0F6CDF]/20 to-[#0F6CDF]/5",
    borderGlow: "ring-[#0F6CDF]/50",
  },
  {
    id: "SOL",
    name: "Solana",
    tagline: "Outpace the L1s",
    lore: "Speed. Plant the bomb, strike fast.",
    color: "text-[#F97316]",
    bgGradient: "from-[#F97316]/20 to-[#F97316]/5",
    borderGlow: "ring-[#F97316]/50",
  },
];

export function TeamSelect() {
  const { team, pickTeam, setStage } = useGameFlowStore();

  const handlePick = (id: TeamId) => {
    pickTeam(id);
    setStage("inventory");
  };

  const handleRandom = () => {
    const id: TeamId = Math.random() < 0.5 ? "ETH" : "SOL";
    pickTeam(id);
    setStage("inventory");
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-b from-[#0A0A0F] to-[#1A1A2E] p-4 safe-area-top safe-area-x overflow-auto">
      <motion.header
        className="text-center py-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl font-bold text-white">Choose your side</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">ETH vs SOL — one round, one winner</p>
      </motion.header>

      <div className="flex flex-col gap-6 flex-1 max-w-md mx-auto w-full">
        {TEAMS.map((t, i) => (
          <motion.button
            key={t.id}
            type="button"
            onClick={() => handlePick(t.id)}
            className={`relative w-full rounded-2xl border-2 p-5 text-left transition-all touch-target min-h-[120px] bg-gradient-to-br ${t.bgGradient} ${
              team === t.id ? `ring-2 ${t.borderGlow} border-white/30` : "border-white/10 hover:border-white/20"
            }`}
            initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start gap-4">
              {/* Hero icon: mech (ETH) / speed (SOL) */}
              <span className="text-4xl flex-shrink-0" aria-hidden>
                {t.id === "ETH" ? "🛡️" : "⚡"}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className={`font-bold text-lg ${t.color}`}>{t.name}</h2>
                <p className="text-sm font-medium text-white mt-0.5">{t.tagline}</p>
                <p className="text-xs text-[var(--color-muted)] mt-2">{t.lore}</p>
              </div>
            </div>
            {team === t.id && (
              <motion.span
                className="absolute top-3 right-3 text-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                aria-hidden
              >
                ✓
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>

      <div className="mt-4 pb-4 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleRandom}
          className="min-h-[44px] px-4 rounded-xl border border-white/20 text-[var(--color-muted)] touch-target active:bg-white/10 text-sm"
        >
          Random team
        </button>
        <p className="text-center text-xs text-[var(--color-muted)]">
          Guest? Pick random or connect wallet to lock in.
        </p>
      </div>
    </div>
  );
}
