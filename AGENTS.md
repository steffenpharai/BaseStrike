# Agent Instructions: BaseRift Base Mini App

**Mode:** Autonomous, YOLO. Do not stop until the app is production-ready.

## Primary Target

**basestrike** (`/basestrike/`) is the main app: a Base Mini App (Farcaster-compatible) top-down tactical shooter with multiplayer, replays, Base Pay, Quick Auth, and notifications. Make it production-ready.

**base-mini-app** (`/base-mini-app/`) is a simpler Mini App template; improve it only when relevant to basestrike or when explicitly requested.

## Authority and Permissions

- **Use `sudo` when required** for system operations (e.g. installing Foundry, global tools, fixing permissions).
- **Do not ask for permission** for routine dev tasks: adding deps, creating files, running tests, fixing lint/type errors.
- **Autonomous execution:** run commands (install, build, lint, typecheck, test, e2e). Fix failures before moving on.
- **Production readiness:** treat the production checklist (see rules) as mandatory. Work through it until satisfied.

## Definition of Done (Production-Ready)

1. **Build & quality**
   - `npm run build` succeeds in **basestrike** (and base-mini-app if touched).
   - `npm run lint` and `npm run typecheck` pass (add scripts if missing).
   - Unit and/or integration tests exist and pass; add `npm test` and run it.
   - E2E tests exist for critical paths (home, manifest, auth, game/replay if present); add `npm run test:e2e` and run it (use Playwright or similar).

2. **Base Mini App contract**
   - Manifest served at `/.well-known/farcaster.json` and (if used) `/api/manifest`; `vercel.json` rewrites correct.
   - Quick Auth: `/api/auth` verifies JWT; domain matches `MINIAPP_DOMAIN`; `DEV_AUTH_BYPASS` only in development.
   - Webhook: `/api/webhook` responds < 3s, verifies signature (Neynar), handles `miniapp_added` / `miniapp_removed`; no heavy work in request path.
   - Env: `.env.example` documents all vars; no secrets in code; production uses `NODE_ENV=production`, `DEV_AUTH_BYPASS=false`, unique `SESSION_SECRET`.

3. **Security**
   - No hardcoded secrets or API keys.
   - Server-side verification for auth and payments; never trust client-only “paid” or “authenticated” flags.
   - Webhook and auth routes validate input (e.g. Zod) and respond with safe status codes.

4. **Deployability**
   - App deploys to Vercel (or configured platform) without code changes; env-only config.
   - README/DEPLOYMENT.md (or equivalent) describe deploy steps and production checklist.

5. **Stability**
   - No uncaught promise rejections or missing error handling on critical paths.
   - Game/Phaser loads without crashing; match/replay logic (if present) does not throw in normal use.

## Repo Layout (Actual)

- **basestrike:** single Next.js app at repo root.
  - `app/` – pages, layout, API routes (`api/auth`, `api/webhook`, etc.), `.well-known/farcaster.json`.
  - `lib/` – config, auth, game (match-server, replay-store), notifications.
  - `components/` – e.g. GameContainer.
  - Config: `minikit.config.ts`, `next.config.ts`, `vercel.json`.
- **base-mini-app:** separate Next.js app under `base-mini-app/`.
- CI (e.g. `.github/workflows/ci.yml`) may reference `apps/web` or `packages/contracts`; align jobs with actual paths (e.g. run from `basestrike/` if monorepo layout was simplified).

## Workflow

1. **Understand:** Read README, ARCHITECTURE, DEPLOYMENT, and key source (auth, webhook, game entry).
2. **Stabilize:** Ensure install, build, lint, typecheck, test, e2e all exist and pass. Fix failures.
3. **Production checklist:** Implement or verify each item in `.cursor/rules/production-checklist.mdc` (and related rules).
4. **Iterate:** Run full pipeline after changes; fix regressions; repeat until production-ready.

## References

- Base Mini Apps: https://docs.base.org/building-with-base/mini-apps
- Manifest: https://docs.base.org/building-with-base/mini-apps/manifest
- Auth: https://docs.base.org/building-with-base/mini-apps/authentication
- Payments: https://docs.base.org/building-with-base/mini-apps/payments
- Notifications: https://docs.base.org/building-with-base/mini-apps/notifications
- Embeds: https://docs.base.org/building-with-base/mini-apps/embeds
- Design (mobile-first UX): https://docs.base.org/mini-apps/featured-guidelines/design-guidelines

## Cursor Rules

Project-specific rules live in `.cursor/rules/`. Key rule files:

- **production-checklist.mdc** – Production readiness; always apply.
- **base-miniapp.mdc** – Manifest, auth, webhook, payments, env.
- **design-guidelines.mdc** – Mobile-first UX (layout, nav, touch 44px, colors, typography).
- **typescript-next.mdc** – TypeScript and Next.js conventions.
- **game-phaser.mdc** – Game/match server and Phaser usage.
- **security-env.mdc** – Secrets, env, and safe defaults.

Follow these rules when making changes. Do not stop until the app meets the Definition of Done above.
