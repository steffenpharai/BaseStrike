"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Wallet } from "@coinbase/onchainkit/wallet";

interface User {
  pfpUrl?: string | null;
  displayName?: string | null;
  username?: string | null;
}

interface HeaderWalletProps {
  user: User | null | undefined;
  displayName: string;
}

/**
 * Subtle header entry: avatar-only trigger opens dropdown with "Connect wallet" / Wallet.
 * Product: no 0x addresses in header; display name only.
 */
export function HeaderWallet({ user, displayName }: HeaderWalletProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: Event) => {
      const target = e.target as Node;
      if (ref.current && !ref.current.contains(target)) setOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex items-center min-h-[44px] touch-target">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-background-alt)] min-h-[44px] min-w-[44px] pr-2"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={open ? "Close wallet menu" : "Open wallet menu"}
      >
        {user?.pfpUrl ? (
          <span className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-700 ring-2 ring-transparent">
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
          <span
            className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-300 flex-shrink-0"
            aria-hidden
          >
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="text-sm text-gray-400 truncate max-w-[80px]" title={displayName}>
          {displayName}
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 min-w-[200px] rounded-xl border border-white/10 bg-[var(--color-background-alt)] shadow-xl py-3 px-3"
          role="menu"
        >
          <p className="text-xs text-gray-500 mb-2 px-1">Wallet</p>
          <div className="min-h-[44px] flex items-center" onClick={(e) => e.stopPropagation()}>
            <Wallet />
          </div>
        </div>
      )}
    </div>
  );
}
