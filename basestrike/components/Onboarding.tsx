"use client";

import { useState } from "react";

const ONBOARDING_KEY = "basestrike_onboarded";

export function getOnboardingComplete(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(ONBOARDING_KEY) === "1";
  } catch {
    return false;
  }
}

export function setOnboardingComplete(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, "1");
  } catch {
    // ignore
  }
}

const SCREENS: { title: string; body: string; emoji: string }[] = [
  {
    title: "Moltbots play",
    body: "Autonomous agents battle in the arena. You watch and bet on the outcome.",
    emoji: "🤖",
  },
  {
    title: "Watch live or replays",
    body: "See matches in real time or catch up with replays.",
    emoji: "▶️",
  },
  {
    title: "Bet on ETH vs SOL",
    body: "Pick a side, place your wager, and get paid when your team wins on Base.",
    emoji: "💰",
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

/** First-time onboarding: ≤3 screens, then main app (Base Featured). */
export function Onboarding({ onComplete }: OnboardingProps) {
  const [screen, setScreen] = useState(0);
  const current = SCREENS[screen];
  const isLast = screen === SCREENS.length - 1;

  const handleNext = () => {
    if (isLast) {
      setOnboardingComplete();
      onComplete();
    } else {
      setScreen((s) => s + 1);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 justify-center items-center px-6 py-8 bg-gradient-to-b from-[#0A0A0F] to-[#1A1A2E]">
      <div className="flex flex-col items-center max-w-sm w-full">
        <span className="text-5xl mb-4" aria-hidden>
          {current.emoji}
        </span>
        <h2 className="text-xl font-bold text-[var(--color-foreground)] text-center mb-2">
          {current.title}
        </h2>
        <p className="text-sm text-[var(--color-muted)] text-center mb-8">
          {current.body}
        </p>
        <div className="flex gap-2 mb-6">
          {SCREENS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full min-w-[24px] ${
                i === screen ? "bg-[var(--color-primary)] w-8" : "bg-white/20 w-4"
              }`}
              aria-hidden
            />
          ))}
        </div>
        <button
          type="button"
          onClick={handleNext}
          className="w-full min-h-[44px] bg-[var(--color-primary)] active:bg-[var(--color-primary-active)] text-white font-semibold rounded-xl transition-colors touch-target"
        >
          {isLast ? "Get started" : "Next"}
        </button>
      </div>
    </div>
  );
}
