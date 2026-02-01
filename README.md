# Base

- **basestrike/** – BaseRift: Base Mini App (Farcaster) tactical shooter. Deploy this to Vercel; set **Root Directory** to `basestrike`.
- **base-mini-app/** – Simpler Mini App template (OnchainKit).

See [AGENTS.md](AGENTS.md) for development and production checklist.  
Base Mini App and Vercel usage: [docs/GUIDELINES-BASE-AND-VERCEL.md](docs/GUIDELINES-BASE-AND-VERCEL.md).

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
