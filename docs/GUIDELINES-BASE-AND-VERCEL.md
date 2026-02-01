# Base Mini App & Vercel Guidelines

Reference for building and deploying Base Mini Apps (Farcaster-compatible) on Vercel. Use this when preparing for git push and production.

## Base Mini App Guidelines

**Docs:** [docs.base.org/mini-apps](https://docs.base.org/mini-apps/quickstart/migrate-existing-apps)

### Building for the Base App

- **One core need:** Focus on one thing the app does really well; keep it simple and easy to understand.
- **Audience:** Base users are social, onchain-native, interested in creating, earning, trading, and connecting.
- **Successful apps:** Help people earn, create, or have fun; low-friction onboarding; no upfront personal info or complex setup.
- **Featured guidelines:** Follow [Product](https://docs.base.org/mini-apps/featured-guidelines/product-guidelines), [Design](https://docs.base.org/mini-apps/featured-guidelines/design-guidelines), [Technical](https://docs.base.org/mini-apps/featured-guidelines/technical-guidelines), [Notification](https://docs.base.org/mini-apps/featured-guidelines/notification-guidelines).

### Manifest (required for discovery)

- **URL:** Manifest must be publicly accessible at `https://your-domain.com/.well-known/farcaster.json`.
- **Implementation:** Use `/public/.well-known/farcaster.json` or a route that serves the manifest; Vercel can rewrite `/.well-known/farcaster.json` → `/api/manifest`.
- **Required fields:** `accountAssociation` (header, payload, signature from [Base Build Account association tool](https://www.base.dev/preview?tab=account)), `miniapp.version` `"1"`, `miniapp.name` (≤32 chars), `homeUrl`, `iconUrl`, `splashImageUrl`, `splashBackgroundColor`, `primaryCategory`, `tags` (max 5), `tagline`, `heroImageUrl`, `screenshotUrls` (max 3). Add `webhookUrl` only if using notifications.
- **Categories:** One of: `games`, `social`, `finance`, `utility`, `productivity`, `health-fitness`, `news-media`, `music`, `shopping`, `education`, `developer-tools`, `entertainment`, `art-creativity`.
- **noindex:** Set `"noindex": true` for development/staging so the app is not indexed in search.

### Technical guidelines (featured)

- **Complete metadata:** Manifest at `/.well-known/farcaster.json`; all required fields valid; images and text within size/format limits. Validate at [base.dev/preview](https://base.dev/preview).
- **In-app auth:** No external redirects; no email/phone verification; users can explore before sign-in when possible. Use Quick Auth / SIWF or wallet auth.
- **Client-agnostic:** No Farcaster-only links or wording; use “Share to Feed” not “Share to Farcaster”; keep users in Base app for supported features.
- **Sponsor transactions:** Use a paymaster (e.g. [Base Paymaster](https://docs.base.org/onchainkit/paymaster/quickstart-guide)) to sponsor fees.
- **Batch transactions (EIP-5792):** Where applicable, batch sequential actions (e.g. approve + swap) into a single request.

### Auth, webhook, env

- **Auth:** `/api/auth` verifies JWT with domain matching `MINIAPP_DOMAIN`; issue session token (e.g. HS256). `DEV_AUTH_BYPASS` only in development.
- **Webhook:** `/api/webhook` must respond with 200 within **3 seconds**; verify signature (e.g. Neynar); handle `miniapp_added` / `miniapp_removed`; do heavy work asynchronously.
- **Env:** Document all vars in `.env.example`; no secrets in repo. Production: `NODE_ENV=production`, `DEV_AUTH_BYPASS=false`, `MINIAPP_DOMAIN`, `ACCOUNT_ASSOCIATION_*`, `NEYNAR_API_KEY`, `SESSION_SECRET`.

---

## Vercel Usage

**Docs:** [vercel.com/docs](https://vercel.com/docs)

### Git and deployments

- **Connect repo:** [New Project](https://vercel.com/new) → import GitHub/GitLab/Bitbucket repo. Set project name, framework preset, **root directory** (e.g. `basestrike` if deploying only that app), build/output settings, and **environment variables**.
- **Production branch:** Default is `main` (then `master`). Production deployments are created on every merge to this branch. Change under Project Settings → Environments → Production → Branch Tracking.
- **Preview deployments:** Every push to a non-production branch gets a unique preview URL. Use for testing before merging.
- **Root directory:** For this repo, when deploying **basestrike**, set root directory to `basestrike` in Vercel project settings so install/build run from that folder.

### Project configuration

- **File:** Use `vercel.json` (or `vercel.ts`) in the app root (e.g. `basestrike/vercel.json`).
- **Common settings:** `buildCommand`, `installCommand`, `framework`, `rewrites`, `headers`, `redirects`, `functions` (memory, duration, runtime).
- **Manifest rewrite:** Ensure `/.well-known/farcaster.json` is rewritten to your manifest route (e.g. `/api/manifest`) so the Base app can fetch the manifest from your Vercel URL.

### Environment variables

- Set in Vercel Dashboard → Project → Settings → Environment Variables. Use Production / Preview / Development as needed.
- **Never** commit `.env` or `.env.local`; use `.env.example` only (no real secrets).

### Deploy

- **From Git:** Push to the connected repo; Vercel builds and deploys automatically.
- **From CLI:** `npx vercel` (preview) or `npx vercel --prod` (production). Useful when not using Git or for one-off deploys.

---

## Pre–push checklist

- [ ] No `.env` or `.env.local` committed (root and app `.gitignore` exclude them).
- [ ] `npm run build` and `npm run lint` pass in the app you’re deploying (e.g. `basestrike`).
- [ ] Manifest available at `/.well-known/farcaster.json` (or rewrite to `/api/manifest`).
- [ ] Production env on Vercel: `NODE_ENV=production`, `DEV_AUTH_BYPASS=false`, and all required vars set.
- [ ] Default branch is `main` (or match Vercel production branch).
