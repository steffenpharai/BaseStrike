"use client";
import { ReactNode, useEffect, useLayoutEffect } from "react";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { sdk } from "@farcaster/miniapp-sdk";
import "@coinbase/onchainkit/styles.css";

// Signal ready as soon as this module loads (before React mount) so base.dev / host gets it early.
if (typeof window !== "undefined") {
  void sdk.actions.ready();
}

export function RootProvider({ children }: { children: ReactNode }) {
  // Sync after commit so host gets ready before paint if module load was too early.
  useLayoutEffect(() => {
    void sdk.actions.ready();
  }, []);
  // After first paint (per Base docs); ensures host sees ready even if it only listens after load.
  useEffect(() => {
    void sdk.actions.ready();
  }, []);

  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
      config={{
        appearance: { mode: "auto" },
        wallet: { display: "modal", preference: "all" },
      }}
      miniKit={{ enabled: true, autoConnect: true }}
    >
      {children}
    </OnchainKitProvider>
  );
}
