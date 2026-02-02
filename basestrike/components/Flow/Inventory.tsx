"use client";

import { motion } from "framer-motion";
import { useGameFlowStore, type WeaponSlot } from "@/lib/stores/gameFlowStore";

const WEAPONS: { id: WeaponSlot; label: string; icon: string }[] = [
  { id: "pistol", label: "Pistol", icon: "🔫" },
  { id: "rifle", label: "Rifle", icon: "🛡️" },
  { id: "shotgun", label: "Shotgun", icon: "💥" },
];

export function Inventory() {
  const { loadout, updateLoadout, setStage } = useGameFlowStore();

  const setPrimary = (id: WeaponSlot) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(30);
    updateLoadout({ primary: id });
  };

  const handleReady = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
    setStage("queue");
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-b from-[#0A0A0F] to-[#1A1A2E] p-4 safe-area-top safe-area-x overflow-auto">
      <motion.header
        className="flex items-center gap-3 py-4"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <button
          type="button"
          onClick={() => setStage("team")}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[var(--color-muted)] touch-target active:text-white active:bg-white/10"
          aria-label="Back to team select"
        >
          ←
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-bold text-white">Loadout</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Primary weapon · Kenney arsenal</p>
        </div>
        <span className="w-11" aria-hidden />
      </motion.header>

      {/* Slots: Primary */}
      <motion.section
        className="max-w-md mx-auto w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <h2 className="text-sm font-semibold text-[var(--color-muted)] mb-3">Primary</h2>
        <div className="grid grid-cols-3 gap-3">
          {WEAPONS.map((w) => (
            <motion.button
              key={w.id}
              type="button"
              onClick={() => setPrimary(w.id)}
              className={`flex flex-col items-center justify-center min-h-[100px] rounded-xl border-2 touch-target transition-all ${
                loadout.primary === w.id
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/20 ring-2 ring-[var(--color-primary)]/40"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
              whileTap={{ scale: 0.96 }}
            >
              <span className="text-3xl mb-1" aria-hidden>{w.icon}</span>
              <span className="text-xs font-medium text-white">{w.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Preview / Randomize */}
      <motion.div
        className="max-w-md mx-auto w-full mt-6 flex gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <button
          type="button"
          onClick={() => {
            const random = WEAPONS[Math.floor(Math.random() * WEAPONS.length)]!;
            setPrimary(random.id);
          }}
          className="flex-1 min-h-[44px] rounded-xl border border-white/20 bg-white/5 text-sm font-medium text-white touch-target active:bg-white/10"
        >
          Randomize
        </button>
      </motion.div>

      {/* Ready — glow CTA */}
      <motion.div
        className="max-w-md mx-auto w-full mt-auto pt-8 pb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <button
          type="button"
          onClick={handleReady}
          className="w-full min-h-[52px] rounded-xl bg-[var(--color-primary)] text-white font-bold text-lg touch-target active:scale-[0.98] transition-transform shadow-lg shadow-[var(--color-primary)]/30"
        >
          Ready
        </button>
      </motion.div>
    </div>
  );
}
