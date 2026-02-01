# App UX Research: Mobile-First (Base Mini App Design Guidelines)

**Source:** [Base Mini Apps – Design Guidelines](https://docs.base.org/mini-apps/featured-guidelines/design-guidelines)  
**Principle:** Build a mini app that is **intuitive and delightful**, **mobile-first**.

---

## 1. Display

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

## 4. Colors

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

## 7. Touch Interactions

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

## Checklist (Mobile-First)

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

- [Design Guidelines](https://docs.base.org/mini-apps/featured-guidelines/design-guidelines)
- [Manifest](https://docs.base.org/mini-apps/core-concepts/manifest)
- [Featured Guidelines Overview](https://docs.base.org/mini-apps/featured-guidelines/overview)
