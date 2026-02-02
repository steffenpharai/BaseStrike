"use client";

export type TabId = "watch" | "bet" | "profile";

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: "watch", icon: "▶️", label: "Watch" },
  { id: "bet", icon: "💰", label: "Bet" },
  { id: "profile", icon: "👤", label: "Profile" },
];

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

/** Slim bottom nav; Watch/Bet/Profile (Base design: 44px touch, labels under icons). */
export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="flex-shrink-0 bg-[var(--color-background-alt)]/95 backdrop-blur-sm border-t border-white/10 safe-area-x safe-area-pb">
      <div className="flex justify-around w-full px-2 py-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-3 py-1.5 rounded-lg transition-colors touch-target ${
              activeTab === tab.id
                ? "text-[var(--color-primary)] bg-[var(--color-primary)]/15 ring-2 ring-[var(--color-primary)]/40"
                : "text-gray-400 active:text-white active:bg-white/10"
            }`}
          >
            <span className="text-xl" aria-hidden>
              {tab.icon}
            </span>
            <span className="text-xs mt-0.5">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
