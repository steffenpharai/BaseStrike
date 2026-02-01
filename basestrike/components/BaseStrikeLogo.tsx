"use client";

import React from "react";

/**
 * BaseStrike logo: tactical crosshair mark + wordmark.
 * Follows Base design guidelines: semantic colors, Inter, contrast; Base motion: intention-first, cubic-bezier 0.4/0/0.2/1, snappy (120–240ms).
 */
export function BaseStrikeLogo({
  variant = "full",
  className = "",
  animated = true,
}: {
  variant?: "full" | "icon";
  className?: string;
  animated?: boolean;
}) {
  const motionClass = animated ? "basestrike-logo-entrance" : "";

  return (
    <div
      className={`inline-flex items-center gap-2 min-h-[44px] ${motionClass} ${className}`}
      aria-label="BaseStrike"
    >
      {/* Tactical crosshair mark: circle + cross + center strike dot */}
      <svg
        className="basestrike-logo-mark flex-shrink-0"
        width={variant === "icon" ? 32 : 36}
        height={variant === "icon" ? 32 : 36}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient
            id="basestrike-crosshair-glow"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.6" />
          </linearGradient>
          <filter id="basestrike-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feFlood floodColor="var(--color-primary)" floodOpacity="0.4" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Outer ring */}
        <circle
          cx="20"
          cy="20"
          r="16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.9"
          fill="none"
          className="text-[var(--color-foreground)]"
        />
        {/* Crosshair lines */}
        <line
          x1="20"
          y1="6"
          x2="20"
          y2="14"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          className="text-[var(--color-foreground)]"
        />
        <line
          x1="20"
          y1="26"
          x2="20"
          y2="34"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          className="text-[var(--color-foreground)]"
        />
        <line
          x1="6"
          y1="20"
          x2="14"
          y2="20"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          className="text-[var(--color-foreground)]"
        />
        <line
          x1="26"
          y1="20"
          x2="34"
          y2="20"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          className="text-[var(--color-foreground)]"
        />
        {/* Center strike dot — primary accent */}
        <circle
          cx="20"
          cy="20"
          r="4"
          fill="url(#basestrike-crosshair-glow)"
          filter="url(#basestrike-glow)"
        />
        <circle cx="20" cy="20" r="2.5" fill="var(--color-primary)" />
      </svg>

      {variant === "full" && (
        <span
          className="font-bold text-[var(--color-foreground)] tracking-tight text-xl basestrike-logo-wordmark"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          BaseStrike
        </span>
      )}
    </div>
  );
}
