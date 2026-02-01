# Base

- **basestrike/** – BaseRift: Base Mini App (Farcaster) tactical shooter. **Deploy from Vercel with Root Directory = `basestrike`.**
- **base-mini-app/** – Simpler Mini App template (OnchainKit).

See [AGENTS.md](AGENTS.md) for development and production checklist.  
Base Mini App and Vercel: [docs/GUIDELINES-BASE-AND-VERCEL.md](docs/GUIDELINES-BASE-AND-VERCEL.md).

## Vercel deploy (Base Build)

1. Import this repo in [Vercel](https://vercel.com/new).
2. Set **Root Directory** to **`basestrike`** (required – repo has multiple apps).
3. Add env vars (see `basestrike/.env.example`). For Base Build preview, generate **accountAssociation** at [base.dev/preview → Account association](https://www.base.dev/preview?tab=account) and set `ACCOUNT_ASSOCIATION_HEADER`, `ACCOUNT_ASSOCIATION_PAYLOAD`, `ACCOUNT_ASSOCIATION_SIGNATURE` in Vercel.
4. Deploy. Manifest: `https://your-app.vercel.app/.well-known/farcaster.json`. Test in [Base Build Preview](https://www.base.dev/preview).

Docs: [Migrate an Existing App](https://docs.base.org/mini-apps/quickstart/migrate-existing-apps).

## Push to remote

```bash
# Set your Git identity (once per machine or repo)
git config --global user.email "your@email.com"
git config --global user.name "Your Name"

# Add remote and push
git remote add origin <your-repo-url>
git push -u origin main
```

Then in [Vercel](https://vercel.com/new), import the repo and set **Root Directory** to `basestrike` (or `base-mini-app`) for the app you want to deploy.
