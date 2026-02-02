"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { sdk, quickAuth } from "@farcaster/miniapp-sdk";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { BaseRiftLogo } from "@/components/BaseRiftLogo";
import { BottomNav, type TabId } from "@/components/BottomNav";
import { HeaderWallet } from "@/components/HeaderWallet";
import { LeaderboardModal } from "@/components/LeaderboardModal";
import { Onboarding, getOnboardingComplete } from "@/components/Onboarding";
import { WatchTab } from "@/components/WatchTab";
import { BetTab } from "@/components/BetTab";

const BETA_CAP = 100;

type BetaStatus = { count: number; full: boolean; cap: number } | null;
type BetaSignupState = "idle" | "loading" | "joined" | "already" | "full" | "error";

/** User display name only (Product: no 0x addresses). */
function userDisplayName(displayName?: string | null, username?: string | null): string {
  if (displayName && typeof displayName === "string") return displayName;
  if (username && typeof username === "string") return username;
  return "Guest";
}

export default function Home() {
  const { setMiniAppReady, isMiniAppReady, context } = useMiniKit();
  const [onboarded, setOnboarded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("watch");
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [betaStatus, setBetaStatus] = useState<BetaStatus>(null);
  const [betaSignupState, setBetaSignupState] = useState<BetaSignupState>("idle");

  useEffect(() => {
    sdk.actions.ready({ disableNativeGestures: true });
  }, []);
  useEffect(() => {
    if (!isMiniAppReady) setMiniAppReady({ disableNativeGestures: true });
  }, [setMiniAppReady, isMiniAppReady]);

  useEffect(() => {
    setOnboarded(getOnboardingComplete());
  }, []);

  const fetchBetaStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/beta-signup");
      if (res.ok) {
        const data = await res.json();
        setBetaStatus({ count: data.count, full: data.full, cap: data.cap ?? BETA_CAP });
      }
    } catch {
      setBetaStatus(null);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "profile") fetchBetaStatus();
  }, [activeTab, fetchBetaStatus]);

  const joinBeta = useCallback(async () => {
    setBetaSignupState("loading");
    try {
      const token = await quickAuth.getToken();
      const res = await fetch("/api/beta-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok && data.added) {
        setBetaSignupState("joined");
        setBetaStatus((prev) => (prev ? { ...prev, count: prev.count + 1 } : { count: 1, full: false, cap: BETA_CAP }));
      } else if (res.ok && data.alreadySignedUp) {
        setBetaSignupState("already");
      } else if (res.status === 409 || data.full) {
        setBetaSignupState("full");
        fetchBetaStatus();
      } else {
        setBetaSignupState("error");
      }
    } catch {
      setBetaSignupState("error");
    }
  }, [fetchBetaStatus]);

  const user = context?.user;
  const displayName = userDisplayName(user?.displayName, user?.username);

  if (!onboarded) {
    return (
      <div className="h-dvh w-full min-w-0 max-w-full overflow-hidden bg-[var(--color-background)] text-white flex flex-col font-sans safe-area-top safe-area-x">
        <Onboarding onComplete={() => setOnboarded(true)} />
      </div>
    );
  }

  return (
    <div className="h-dvh w-full min-w-0 max-w-full overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)] flex flex-col font-sans safe-area-top safe-area-x">
      <header className="bg-[var(--color-background-alt)]/90 backdrop-blur-sm border-b border-white/10 px-3 py-2 flex-shrink-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col gap-0.5 min-h-[44px] justify-center">
            <h1 className="flex items-center">
              <BaseRiftLogo variant="full" animated />
            </h1>
            <p className="text-xs text-[var(--color-muted)]" aria-label="Built by">
              built by stefo0.base.eth
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLeaderboardOpen(true)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-gray-400 hover:text-[var(--color-primary)] touch-target"
              aria-label="Leaderboard"
            >
              <span className="text-xl" aria-hidden>🏆</span>
            </button>
            <HeaderWallet user={user} displayName={displayName} />
          </div>
        </div>
      </header>
      <LeaderboardModal open={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} />

      <main className="flex-1 min-h-0 overflow-hidden flex flex-col main-content-pb">
        {activeTab === "watch" && <WatchTab />}
        {activeTab === "bet" && <BetTab />}
        {activeTab === "profile" && (
          <div className="flex-1 min-h-0 overflow-auto flex flex-col items-center p-4 bg-[var(--color-background)]">
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
                <h2 className="text-lg font-bold text-[var(--color-foreground)]">{displayName}</h2>
                <p className="text-sm text-gray-400 mt-1 mb-4">Stats and match history coming soon</p>

                <section className="w-full max-w-sm rounded-xl bg-[var(--color-background-alt)] px-4 py-3 border border-white/10" aria-label="Join beta">
                  <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-1">Help us test</h3>
                  <p className="text-xs text-gray-400 mb-3">
                    Join the beta list (max {betaStatus?.cap ?? BETA_CAP} testers). We&apos;ll reach out before launch.
                  </p>
                  {betaStatus && (
                    <p className="text-xs text-gray-500 mb-3" aria-live="polite">
                      {betaStatus.count}/{betaStatus.cap} spots
                    </p>
                  )}
                  {betaSignupState === "joined" || betaSignupState === "already" ? (
                    <p className="text-sm text-green-400 font-medium min-h-[44px] flex items-center justify-center touch-target">
                      {`You're on the list`}
                    </p>
                  ) : betaStatus?.full ? (
                    <p className="text-sm text-gray-400 min-h-[44px] flex items-center justify-center touch-target">
                      Beta list is full
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={joinBeta}
                      disabled={betaSignupState === "loading"}
                      className="w-full min-h-[44px] bg-[var(--color-primary)] active:bg-[var(--color-primary-active)] disabled:opacity-60 text-white font-semibold rounded-xl transition-colors touch-target"
                    >
                      {betaSignupState === "loading" ? "Joining…" : betaSignupState === "error" ? "Try again" : "Join the beta"}
                    </button>
                  )}
                  {betaSignupState === "error" && (
                    <p className="text-xs text-red-400 mt-2 text-center">Something went wrong. Sign in in the Base app and try again.</p>
                  )}
                </section>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2" aria-hidden>👤</div>
                <h2 className="text-lg font-bold text-[var(--color-foreground)] mb-1">Profile</h2>
                <p className="text-sm text-gray-400 mb-4">Sign in to see your stats and match history</p>
                <section className="w-full max-w-sm rounded-xl bg-[var(--color-background-alt)] px-4 py-3 border border-white/10" aria-label="Join beta">
                  <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-1">Help us test</h3>
                  <p className="text-xs text-gray-400">
                    Sign in to join the beta tester list (max {BETA_CAP} people). We&apos;ll reach out before launch.
                  </p>
                </section>
              </>
            )}
          </div>
        )}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
