"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { BaseRiftLogo } from "@/components/BaseRiftLogo";

const GameContainer = dynamic(
  () => import("@/components/GameContainer").then(mod => ({ default: mod.GameContainer })),
  { ssr: false, loading: () => <div className="w-full aspect-[4/3] bg-gray-800 animate-pulse rounded-lg" /> }
);

export default function Home() {
  const { setMiniAppReady, isMiniAppReady, context } = useMiniKit();
  const [playerId] = useState(() => `player_${Math.random().toString(36).substr(2, 9)}`);
  const [matchId] = useState(() => `match_${Date.now()}`);
  const [activeTab, setActiveTab] = useState<"play" | "ranked" | "profile">("play");

  useEffect(() => {
    if (!isMiniAppReady) setMiniAppReady();
  }, [setMiniAppReady, isMiniAppReady]);

  const handleAction = (action: unknown) => console.log("Game action:", action);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      {/* Compact Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="flex items-center min-h-[44px]">
            <BaseRiftLogo variant="full" animated />
          </h1>
          <div className="flex items-center gap-3">
            {context?.user && (
              <span className="text-sm text-gray-400 truncate max-w-[100px]">
                {context.user.displayName || "Guest"}
              </span>
            )}
            <Wallet />
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-auto p-4 pb-20">
        {activeTab === "play" && (
          <div className="space-y-4">
            {/* Game Canvas */}
            <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg">
              <GameContainer playerId={playerId} matchId={matchId} onAction={handleAction} />
            </div>

            {/* Controls Hint */}
            <div className="bg-gray-800/50 rounded-lg px-4 py-3 text-center text-sm text-gray-400">
              <span className="hidden sm:inline">WASD to move | Click to shoot</span>
              <span className="sm:hidden">Tap joystick to move | Tap to shoot</span>
            </div>
          </div>
        )}

        {activeTab === "ranked" && (
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-xl font-bold mb-2">Ranked Queue</h2>
            <p className="text-gray-400 mb-6">Stake 0.001 ETH to compete for prizes</p>
            <button className="w-full min-h-[48px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl transition-colors">
              Coming Soon
            </button>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-5xl mb-4">👤</div>
            <h2 className="text-xl font-bold mb-2">Profile</h2>
            <p className="text-gray-400">Stats and match history coming soon</p>
          </div>
        )}
      </main>

      {/* Bottom Navigation - Fixed, thumb-reach */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700 px-4 py-2 safe-area-pb">
        <div className="flex justify-around max-w-md mx-auto">
          {[
            { id: "play" as const, icon: "🎮", label: "Play" },
            { id: "ranked" as const, icon: "🏆", label: "Ranked" },
            { id: "profile" as const, icon: "👤", label: "Profile" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center min-w-[64px] min-h-[48px] px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "text-blue-400 bg-blue-500/10"
                  : "text-gray-400 active:text-white active:bg-gray-700"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs mt-0.5">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
