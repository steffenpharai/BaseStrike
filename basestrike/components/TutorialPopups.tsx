"use client";

import { useState, useEffect } from "react";
import { div as MotionDiv } from "framer-motion/client";

const TUTORIAL_DONE_KEY = "basestrike_tutorial_done";

const STEPS: { title: string; body: string; cta: string }[] = [
  {
    title: "Move",
    body: "Use the joystick on the left to move your character.",
    cta: "Next",
  },
  {
    title: "Shoot",
    body: "Tap anywhere on the right side of the screen to shoot.",
    cta: "Next",
  },
  {
    title: "Capture",
    body: "Capture sites A and B to win the round. Stay alive and work with your team!",
    cta: "Got it",
  },
];

/**
 * Progressive tutorial popups (move → shoot → capture) with skip. Persists "done" in localStorage.
 */
export function TutorialPopups() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage.getItem(TUTORIAL_DONE_KEY) === "true") {
        setVisible(false);
        return;
      }
      setVisible(true);
    } catch {
      setVisible(false);
    }
  }, []);

  const finish = () => {
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(TUTORIAL_DONE_KEY, "true");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  const handleNext = () => {
    if (step >= STEPS.length - 1) {
      finish();
    } else {
      setStep((s) => s + 1);
    }
  };

  if (!visible) return null;

  const current = STEPS[step]!;

  return (
    <MotionDiv
      className="absolute inset-0 z-40 flex flex-col items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
      aria-describedby="tutorial-body"
    >
      <div className="max-w-sm w-full rounded-xl border border-white/10 bg-[var(--color-background-alt)] p-5 shadow-xl">
        <h2 id="tutorial-title" className="text-lg font-semibold text-white mb-2">
          {current.title}
        </h2>
        <p id="tutorial-body" className="text-sm text-[var(--color-muted)] mb-4">
          {current.body}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 min-h-[44px] rounded-xl bg-[var(--color-primary)] text-white font-semibold touch-target"
          >
            {current.cta}
          </button>
          <button
            type="button"
            onClick={finish}
            className="min-h-[44px] px-3 rounded-xl border border-white/20 text-gray-400 text-sm touch-target"
          >
            Skip all
          </button>
        </div>
      </div>
    </MotionDiv>
  );
}
