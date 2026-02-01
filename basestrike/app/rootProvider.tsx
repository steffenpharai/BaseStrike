"use client";
import { ReactNode, useEffect, useLayoutEffect } from "react";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { sdk } from "@farcaster/miniapp-sdk";
import "@coinbase/onchainkit/styles.css";

// Base Build preview: sdk.actions.ready() hides splash and displays app.
// https://docs.base.org/mini-apps/quickstart/migrate-existing-apps — "Call ready() as soon as possible"
if (typeof window !== "undefined") {
  void sdk.actions.ready();
}

export function RootProvider({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    void sdk.actions.ready();
  }, []);
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
