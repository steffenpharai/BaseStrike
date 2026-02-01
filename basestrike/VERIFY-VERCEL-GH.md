# Verify Vercel & GitHub for Base Build Preview

If Base Build preview shows **"not ready"** or the splash never hides, the app must call `sdk.actions.ready()` and Vercel must build from the **basestrike** directory. Follow these steps to verify and fix.

## 1. Vercel CLI: verify and set Root Directory

**Verify** (no token; uses your CLI login):

```bash
cd basestrike
vercel link              # ensure project is linked (creates .vercel if needed)
npm run vercel:verify    # or: vercel project inspect
```

Check the output for **Root Directory** — it must be **`basestrike`**.

**Set** Root Directory (CLI has no “set root” command; script uses CLI + API):

```bash
cd basestrike
export VERCEL_TOKEN="your-token"   # from https://vercel.com/account/tokens
npm run vercel:set-root            # or: ./scripts/set-vercel-root.sh
```

The script uses `vercel project ls --json` (CLI) to get the project id, then PATCHes the project (API) to set Root Directory to `basestrike`. Then redeploy (e.g. `vercel --prod` or push to Git).

## 2. Why Root Directory matters

This repo has **base-mini-app**, **basestrike**, and **docs** at the top level. Vercel **must** use **Root Directory = `basestrike`** so that: Vercel **must** use **Root Directory = `basestrike`** so that:

- `npm install` and `npm run build` run inside `basestrike/`
- The deployed app is the Next.js app in `basestrike/` (with `sdk.actions.ready()` in `app/rootProvider.tsx` and `app/page.tsx`)

### Verify / set via Vercel Dashboard

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → your **basestrike** project.
2. Go to **Settings** → **General**.
3. Under **Root Directory**, confirm it is **`basestrike`** (no leading slash).
4. If it was empty or wrong, set it to **`basestrike`**, save, then **Redeploy** (Deployments → ⋮ → Redeploy).

### Deploy from correct directory (CLI)

When using the CLI, run from **basestrike** so the linked project uses the right app:

```bash
cd basestrike
vercel link    # link to your Vercel project if not already
vercel         # preview
vercel --prod  # production
```

If the project was linked from repo root, the **Root Directory** in Vercel project settings still must be **`basestrike`** (set in dashboard as above).

## 3. GitHub

- **Default branch:** Usually `main`. Vercel production deploys from this branch. Check: repo → Settings → Default branch.
- **Vercel Git integration:** Vercel → Project → Settings → Git. Confirm the correct repo and branch are connected. Pushes to `main` should trigger production deploys.

### Quick checks (GH CLI)

```bash
# From repo root
gh repo view --json defaultBranchRef
# Ensure default branch is main (or whatever Vercel production is set to)
```

## 3. Base Build preview & `ready()` call

Per [Base docs](https://docs.base.org/mini-apps/quickstart/migrate-existing-apps):

- **Trigger app display:** Once the app has loaded, call `sdk.actions.ready()` to hide the loading splash and display the app.
- **React:** Call `ready()` inside a `useEffect` hook; call it as soon as possible.
- **Joystick/drag:** Use `sdk.actions.ready({ disableNativeGestures: true })` ([Common Issues](https://docs.base.org/mini-apps/troubleshooting/common-issues)).

This app calls `sdk.actions.ready({ disableNativeGestures: true })` in:

- `app/rootProvider.tsx` (on load and in `useLayoutEffect` / `useEffect`)
- `app/page.tsx` (in `useEffect` when the home page mounts)

If the splash still does not hide:

1. **Confirm the URL you test** is the **production (or latest) deployment** (e.g. `https://your-app.vercel.app`), not an old preview or localhost.
2. **Confirm Root Directory** is `basestrike` and redeploy so the build includes the above code.
3. Open [Base Build Preview](https://www.base.dev/preview), enter your app URL, click Submit. Check the **Console** tab for errors.
4. Ensure **manifest** is reachable: `https://your-app.vercel.app/.well-known/farcaster.json`.

## 5. Checklist

- [ ] Vercel project **Root Directory** = **`basestrike`** (Settings → General).
- [ ] Redeployed after changing Root Directory.
- [ ] Testing the **production** (or latest) deployment URL in Base Build preview.
- [ ] Manifest loads: `curl https://your-app.vercel.app/.well-known/farcaster.json`.
- [ ] GitHub default branch matches Vercel production branch; Git integration connected.

## References

- [Migrate an Existing App](https://docs.base.org/mini-apps/quickstart/migrate-existing-apps) — Add SDK, call `ready()`, manifest, embed metadata.
- [Common Issues & Debugging](https://docs.base.org/mini-apps/troubleshooting/common-issues) — Preview tool, `disableNativeGestures`, validation.
- [Test Your App](https://docs.base.org/mini-apps/troubleshooting/testing) — Base Build preview, Base app, in-feed testing.
- [Vercel General settings](https://vercel.com/docs/project-configuration/general-settings) — Root Directory.
