"use client";
import { ReactNode, useEffect } from "react";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { sdk } from "@farcaster/miniapp-sdk";
import "@coinbase/onchainkit/styles.css";

// Base Build docs: https://docs.base.org/mini-apps/quickstart/migrate-existing-apps
// "Once your app has loaded, call sdk.actions.ready() to hide the loading splash screen and display your app."
// "In React apps, call ready() inside a useEffect hook to prevent it from running on every re-render. Call ready() as soon as possible."
// Joystick/drag: https://docs.base.org/mini-apps/troubleshooting/common-issues — disableNativeGestures: true
const READY_OPTIONS = { disableNativeGestures: true as const };

export function RootProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    sdk.actions.ready(READY_OPTIONS);
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
