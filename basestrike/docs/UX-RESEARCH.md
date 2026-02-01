# Base Mini App Guidelines Research

Research from **docs.base.org** (Mini Apps). Covers Featured Checklist, Design, Product, Technical, and Build Checklist.  
**Principle:** Build a mini app that is **intuitive and delightful**, **mobile-first**, and ready for **featured placement**.

---

## Featured Checklist (Prerequisite for Featured Placement)

**Source:** [Featured Checklist](https://docs.base.org/mini-apps/featured-guidelines/overview)  
Meeting all guidelines below is required for featured placement (not guaranteed). Verify in [Base Build](https://base.dev/), then submit via [submission form](https://docs.google.com/forms/d/e/1FAIpQLSeZiB3fmMS7oxBKrWsoaew2LFxGpktnAtPAmJaNZv5TOCXIZg/viewform).

| Area | Requirements |
|------|---------------|
| **Authentication** | In-app auth only; no external redirects. Wallet connection automatic. No email/phone verification. |
| **Onboarding** | Clear purpose and how to get started (home or pop-up). Only essential personal info with context. Show avatar and username — **no 0x addresses**. |
| **Base Compatibility** | Client-agnostic; no hard-coded Farcaster text/links. Transactions sponsored. |
| **Layout** | CTAs visible and centered; bottom nav or side menu; buttons not cut off; nav items have clear labels. |
| **Load Time** | App loads within **3 seconds**; in-app actions within **1 second**; loading indicators during actions. |
| **Usability** | Light and dark modes; minimum **44px** touch targets. |
| **App Metadata** | Clear, user-focused description. Icon **1024×1024 px**, PNG, **no transparency**, readable at small sizes. Cover photo high quality, **no Base logo or team photos**, **1200×630 px** (1.91:1), PNG/JPG. **3 screenshots** portrait **1284×2778**. Subtitle descriptive, sentence case, no punctuation at end. |

---

## Design Guidelines

**Source:** [Design Guidelines](https://docs.base.org/mini-apps/featured-guidelines/design-guidelines)

### 1. Display

- **Manifest** controls how the app appears (icon, splash, embed). See [manifest](https://docs.base.org/mini-apps/core-concepts/manifest) and [full spec image](https://docs.base.org/images/miniapps/miniapp-design-spec.png).
- Design for the surfaces where the app is shown: discovery, preview, in-app.

---

## 2. Layout (Mobile-First)

| Guideline | Requirement |
|-----------|--------------|
| **Core actions** | Keep near **top or middle** — not hidden behind scroll. |
| **Button count** | Limit buttons; make the **first action obvious**. |
| **CTAs** | Use clear primary labels: "Create", "Start Game", "Deposit". |
| **Viewport** | Design for **small viewports** and **portrait orientation**. |
| **Ergonomics** | **Optimize for thumb reach and one-handed use.** |

**BaseRift alignment:** Play tab is default; game and primary action are in the first screen. Header is compact; main content is scrollable with bottom nav fixed.

---

## 3. Navigation

| Guideline | Requirement |
|-----------|--------------|
| **Primary nav** | Most mini apps should use a **bottom navigation bar**. |
| **Secondary** | Side menu is OK for settings and profile. |
| **Labels** | **Always include labels under icons** so each tab is clear. |
| **Testing** | Test on multiple device sizes; ensure buttons are not cut off. |

**BaseRift alignment:** Fixed bottom nav with Play / Ranked / Profile; labels under emoji icons; `safe-area-pb` for notched devices.

---

### 4. Colors

- **Primary:** Brand color for CTAs and key interactions.
- **Secondary:** Accents and secondary actions.
- **Neutral:** Text, backgrounds, structure — strong contrast.

**Themes:**

- Support **light and dark** modes.
- Keep contrast and brand consistent.
- Respect **system preference** but allow **manual toggle**.
- Use **smooth transitions** between themes.
- **Tip:** Use **semantic tokens** (e.g. `--color-primary`, `--color-background`) with light/dark overrides for maintainability.

**Basestrike:** Currently dark-only; add semantic tokens and optional light/dark when expanding.

---

## 5. Typography

| Guideline | Requirement |
|-----------|--------------|
| **Font** | Easy to read; Base recommends **Inter**. |
| **Contrast** | Sufficient contrast between text and background. |
| **Weights** | Prefer **regular, bold, italic**; decorative/script only for accents. |

**BaseRift alignment:** `--font-sans: "Inter", system-ui, sans-serif` in `globals.css`.

---

## 6. Spacing

| Guideline | Requirement |
|-----------|--------------|
| **Grouping** | Group related elements. |
| **Consistency** | Consistent spacing for rhythm and predictability. |
| **Breathing room** | Use white space; avoid cramped layouts. |
| **Base unit** | Use a base unit (**4px** or **8px**) and scale from it. |
| **Mobile** | 4px base: more granular, better for mobile. 8px: good for desktop. |

**Basestrike:** Tailwind uses 4px base; use `p-4`, `gap-4`, `space-y-4` etc. consistently.

---

### 7. Touch Interactions

| Guideline | Requirement |
|-----------|--------------|
| **Target size** | All touch targets **at least 44px** (e.g. min height/width or padding). |
| **Gestures** | Support tap, swipe, pinch where appropriate. |
| **Hover** | **Do not rely on hover** — it doesn’t exist on touch. Prefer `:active` and clear tap feedback. |

**BaseRift alignment:** Nav tabs use `min-h-[48px]`; primary buttons use `min-h-[48px]`. Game area uses `touch-action: none` and no hover-only controls. Ensure Wallet and any other tappable elements meet 44px.

---

## 8. Viewport & Meta

- Use **viewport** meta: `width=device-width, initial-scale=1` (Next.js App Router adds this by default).
- For notched devices, consider `viewport-fit=cover` and `env(safe-area-inset-*)` for padding (baserift uses `safe-area-pb`).
- **Base app identity:** Set `base:app_id` in page/layout metadata (from Base developer dashboard) so Base can identify the app. Example in root layout:

  ```tsx
  import type { Metadata } from "next";

  export const metadata: Metadata = {
    other: {
      "base:app_id": "697eea9d2aafa0bc9ad8a3b6", // your app id from Base
    },
  };
  ```

---

## Product Guidelines

**Source:** [Product Guidelines](https://docs.base.org/mini-apps/featured-guidelines/product-guidelines)

| Topic | Requirement |
|-------|-------------|
| **Load time** | App loads within **3 seconds**; in-app actions within **1 second**; show loading indicators. |
| **Onboarding** | First-time users see brief explanation of what the app does and how to get started (≤3 screens, succinct). |
| **User info & privacy** | Only ask for personal info when necessary; explain value and why it’s needed; data minimization. |
| **User profile** | Show avatar and username (Base app); **avoid showing 0x addresses**. |
| **App description** | Clear value proposition; one-sentence, human, benefit-focused. |
| **Cover photo** | High quality, engaging; **no Base logo**, **no team photos**; 1200×630 (1.91:1) for featured. |
| **App icon** | **1024×1024 px**, PNG, **no transparency**; clear at 16×16; set via `iconUrl` in farcaster.json. |

---

## Technical Guidelines

**Source:** [Technical Guidelines](https://docs.base.org/mini-apps/featured-guidelines/technical-guidelines)

| Topic | Requirement |
|-------|-------------|
| **Complete metadata** | Manifest at `/.well-known/farcaster.json`; required fields: `accountAssociation`, `frame`, `primaryCategory`, `tags`; images/sizes valid. Validate at [base.dev/preview](https://base.dev/preview). |
| **In-app authentication** | No external redirects; no email/phone verification; users can explore before sign-in when possible. Use in-app SIWF/Quick Auth or wallet auth. |
| **Client-agnostic** | No client-specific URLs (e.g. Farcaster-only); neutral copy (e.g. “Share to Feed” not “Share to Farcaster”); no deeplinks to other clients for features supported in Base app. See [Links](https://docs.base.org/mini-apps/technical-guides/links), [Base App Compatibility](https://docs.base.org/mini-apps/troubleshooting/base-app-compatibility). |
| **Sponsor transactions** | Use a paymaster (recommended: [Base Paymaster](https://docs.base.org/onchainkit/paymaster/quickstart-guide)); claim gas credits at [base.dev](https://base.dev). |
| **Batch transactions (EIP-5792)** | Where applicable, batch sequential actions (e.g. approve + swap) via `wallet_sendCalls` / `wallet_getCapabilities`. |

---

## Build Checklist (Quickstart)

**Source:** [Build Checklist](https://docs.base.org/mini-apps/quickstart/build-checklist)

1. **Register for Base Build** — [base.dev](https://base.dev): Builder Rewards, featured boost, growth insights, Preview tool.
2. **Authentication** — Authenticate when it unlocks value; optional sign-in; [Authentication](https://docs.base.org/mini-apps/core-concepts/authentication).
3. **Manifest** — Complete fields, valid assets, `noindex: true` during testing; [Sign Your Manifest](https://docs.base.org/mini-apps/core-concepts/manifest).
4. **Embeds & Previews** — Compelling preview + launch button; [Embeds & Previews](https://docs.base.org/mini-apps/core-concepts/embeds-and-previews).
5. **Search & Discovery** — Primary category, share once to index, valid assets; [How Search works](https://docs.base.org/mini-apps/troubleshooting/how-search-works).
6. **Sharing & Social Graph** — Native share, social navigation; [Sharing & Social Graph](https://docs.base.org/mini-apps/technical-guides/sharing-and-social-graph).
7. **Notifications** — Re-engage saved users; [Notifications](https://docs.base.org/mini-apps/core-concepts/notifications).
8. **UX Best Practices** — [Design patterns](https://docs.base.org/mini-apps/featured-guidelines/design-guidelines), [OnchainKit](https://docs.base.org/mini-apps/design-ux/onchainkit).
9. **Growth** — [Optimize Onboarding](https://docs.base.org/mini-apps/growth/optimize-onboarding), [Build Viral Mini Apps](https://docs.base.org/mini-apps/growth/build-viral-mini-apps).

---

## Checklist (Mobile-First / Design)

- [ ] Core action visible without scrolling (or minimal scroll).
- [ ] Bottom nav with labels under icons.
- [ ] Portrait and small viewport as primary; test multiple sizes.
- [ ] All interactive elements ≥ 44px touch target.
- [ ] No hover-only interactions; use active/tap states.
- [ ] Semantic color tokens; light/dark support (or planned).
- [ ] Inter (or similar) for body; sufficient text/background contrast.
- [ ] Consistent spacing (4px or 8px base).
- [ ] Safe area insets for notched devices.

---

## References

- [Featured Checklist (overview)](https://docs.base.org/mini-apps/featured-guidelines/overview)
- [Product Guidelines](https://docs.base.org/mini-apps/featured-guidelines/product-guidelines)
- [Design Guidelines](https://docs.base.org/mini-apps/featured-guidelines/design-guidelines)
- [Technical Guidelines](https://docs.base.org/mini-apps/featured-guidelines/technical-guidelines)
- [Notification Guidelines](https://docs.base.org/mini-apps/featured-guidelines/notification-guidelines)
- [Manifest](https://docs.base.org/mini-apps/core-concepts/manifest)
- [Build Checklist](https://docs.base.org/mini-apps/quickstart/build-checklist)
- [Base Build (verify app, preview)](https://base.dev)
- [Design patterns](https://docs.base.org/mini-apps/design-ux/design-patterns) · [Best practices](https://docs.base.org/mini-apps/design-ux/best-practices)
- [Mini App Templates](https://github.com/base/demos/tree/master/mini-apps/templates/farcaster-sdk/mini-app-full-demo)
