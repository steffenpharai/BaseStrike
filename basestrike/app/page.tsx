"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { sdk } from "@farcaster/miniapp-sdk";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { BaseRiftLogo } from "@/components/BaseRiftLogo";

const GameContainer = dynamic(
  () => import("@/components/GameContainer").then(mod => ({ default: mod.GameContainer })),
  { ssr: false, loading: () => <div className="w-full h-full min-h-[120px] bg-gray-800 animate-pulse rounded-lg flex flex-col items-center justify-center gap-2" aria-busy aria-label="Loading game"><span className="text-gray-500 text-sm">Loading…</span></div> }
);

/** User display name only (Product: no 0x addresses). */
function userDisplayName(displayName?: string | null, username?: string | null): string {
  if (displayName && typeof displayName === "string") return displayName;
  if (username && typeof username === "string") return username;
  return "Guest";
}

export default function Home() {
  const { setMiniAppReady, isMiniAppReady, context } = useMiniKit();
  const [playerId] = useState(() => `player_${Math.random().toString(36).substr(2, 9)}`);
  const [matchId] = useState(() => `match_${Date.now()}`);
  const [activeTab, setActiveTab] = useState<"play" | "ranked" | "profile">("play");

  // Base Build: call ready() in useEffect so host hides splash (migrate-existing-apps Step 2)
  useEffect(() => {
    sdk.actions.ready({ disableNativeGestures: true });
  }, []);
  useEffect(() => {
    if (!isMiniAppReady) setMiniAppReady({ disableNativeGestures: true });
  }, [setMiniAppReady, isMiniAppReady]);

  const handleAction = (action: unknown) => console.log("Game action:", action);

  const user = context?.user;
  const displayName = userDisplayName(user?.displayName, user?.username);

  return (
    <div className="h-dvh w-full min-w-0 max-w-full overflow-hidden bg-gray-900 text-white flex flex-col font-sans safe-area-top safe-area-x">
      {/* Compact Header — Product: show avatar + username (no 0x). Base: small viewports. */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between w-full">
          <h1 className="flex items-center min-h-[44px]">
            <BaseRiftLogo variant="full" animated />
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 min-h-[44px] touch-target">
              {user?.pfpUrl ? (
                <span className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-700">
                  <Image
                    src={user.pfpUrl}
                    alt=""
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </span>
              ) : (
                <span className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-300 flex-shrink-0" aria-hidden>
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="text-sm text-gray-400 truncate max-w-[100px]" title={displayName}>
                {displayName}
              </span>
            </div>
            <Wallet />
          </div>
        </div>
      </header>

      {/* Main Content — no scroll; fills viewport; Base: core actions visible, full viewport. */}
      <main className="flex-1 min-h-0 overflow-hidden flex flex-col p-2 main-content-pb">
        <div className="flex-1 min-h-0 min-w-0 w-full flex flex-col">
        {activeTab === "play" && (
          <div className="flex-1 min-h-0 flex flex-col gap-2">
            {/* Onboarding built into Play: purpose + how to get started (Building for the Base App). */}
            <section className="flex-shrink-0 rounded-lg bg-gray-800/80 px-3 py-2" aria-label="How to play">
              <p className="text-xs text-gray-300 text-center leading-relaxed">
                Top-down tactical shooter on Base. Move, aim, shoot—climb the ranks.
              </p>
              <p className="text-xs text-gray-400 text-center mt-1">
                Joystick: move · Tap: shoot
              </p>
            </section>

            {/* Game Canvas — fills remaining viewport on all mobile devices. */}
            <div className="flex-1 min-h-0 min-w-0 rounded-xl overflow-hidden bg-gray-800">
              <GameContainer playerId={playerId} matchId={matchId} onAction={handleAction} />
            </div>
          </div>
        )}

        {activeTab === "ranked" && (
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-4 bg-gray-800 rounded-xl">
            <div className="text-4xl mb-2">🏆</div>
            <h2 className="text-lg font-bold mb-1">Ranked Queue</h2>
            <p className="text-sm text-gray-400 mb-4">Stake 0.001 ETH to compete</p>
            <button className="w-full min-h-[44px] bg-blue-600 active:bg-blue-800 text-white font-semibold rounded-xl transition-colors touch-target">
              Coming Soon
            </button>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-4 bg-gray-800 rounded-xl">
            {/* Product: show avatar + username (no 0x addresses). */}
            {user ? (
              <>
                {user.pfpUrl ? (
                  <span className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-700 mb-3">
                    <Image
                      src={user.pfpUrl}
                      alt=""
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  </span>
                ) : (
                  <span className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center text-2xl font-medium text-gray-300 mb-3" aria-hidden>
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
                <h2 className="text-lg font-bold text-white">{displayName}</h2>
                <p className="text-sm text-gray-400 mt-1">Stats and match history coming soon</p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2" aria-hidden>👤</div>
                <h2 className="text-lg font-bold mb-1">Profile</h2>
                <p className="text-sm text-gray-400">Sign in to see your stats and match history</p>
              </>
            )}
          </div>
        )}
        </div>
      </main>

      {/* Bottom Navigation — Base: bottom nav, labels under icons, 44px touch, safe area. */}
      <nav className="flex-shrink-0 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700 safe-area-x safe-area-pb">
        <div className="flex justify-around w-full px-2 py-2">
          {[
            { id: "play" as const, icon: "🎮", label: "Play" },
            { id: "ranked" as const, icon: "🏆", label: "Ranked" },
            { id: "profile" as const, icon: "👤", label: "Profile" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-4 py-2 rounded-lg transition-colors touch-target ${
                activeTab === tab.id
                  ? "text-blue-400 bg-blue-500/10"
                  : "text-gray-400 active:text-white active:bg-gray-700"
              }`}
            >
              <span className="text-xl" aria-hidden>{tab.icon}</span>
              <span className="text-xs mt-0.5">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
