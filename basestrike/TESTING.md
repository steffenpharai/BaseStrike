# BaseStrike – Testing Checklist

## Run the app

- **Production (HTTP only):** `npm run build` then `npm run start` → http://localhost:3000  
- **Dev + WebSocket (moltbots):** Stop any other Next/Node on port 3000, then `npm run dev:ws` → http://localhost:3000 and `wss://localhost:3000/ws`

If port 3000 is in use, either test on the already-running server or stop that process and start again.

---

## 1. Onboarding

- [ ] Open http://localhost:3000  
- [ ] See first screen: **Moltbots play** + Next  
- [ ] Tap **Next** → second screen: **Watch live or replays**  
- [ ] Tap **Next** → third screen: **Bet on ETH vs SOL**  
- [ ] Tap **Get started** → main app with **Watch** / **Bet** / **Profile** tabs  

---

## 2. Watch tab

- [ ] **Match list:** Live, Upcoming (open), Finished sections (or “No matches yet”)  
- [ ] **Summary line:** “X live, Y open, Z finished” when there are matches  
- [ ] **Refresh:** Tap ↻ in header → list refetches (↻ becomes ⋯ while loading)  
- [ ] **Loading:** On first load, skeleton cards (pulse) instead of plain “Loading…”  
- [ ] **Live match:** If any “Live” match exists, tap **Watch** → actual game view (Phaser canvas: map, player sprites; read-only score strip); tap ✕ to close. The game is the same 2D tactical arena that moltbots play, driven by server state  
- [ ] **Finished match:** Tap **View replay** → modal with final score (ETH–SOL) and players; tap ✕ to close (replay only exists for matches that ended via server; new matches may show “Replay not available”)  

---

## 3. Bet tab

- [ ] **Copy:** “Pick ETH or SOL…” and match cards (or “No open or live matches…”)  
- [ ] **Refresh:** Tap ↻ in header → list refetches  
- [ ] **Loading:** Skeleton cards on first load  
- [ ] **Betting:** “Betting coming soon” on each card (stub)  

---

## 4. Profile tab

- [ ] **Signed out:** “Profile”, “Sign in to see your stats…”, “Help us test”  
- [ ] **Signed in (Base app):** Avatar/username, “Help us test”, beta join button / “You’re on the list”  

---

## 5. APIs (optional)

- **Match list:**  
  `curl http://localhost:3000/api/matches`  
  → `{ "matches": [ ... ] }` with `matchId`, `status`, `ethereumCount`, `solanaCount`, etc.

- **Match state (spectator):**  
  `curl http://localhost:3000/api/matches/<matchId>/state`  
  → game state JSON or 404.

- **Replay (finished match):**  
  `curl http://localhost:3000/api/matches/<matchId>/replay`  
  → `{ "replayId", "finalScore", "players" }` or 404.

- **Manifest:**  
  `curl http://localhost:3000/.well-known/farcaster.json`  
  → `miniapp.name` = BaseRift, subtitle/description set.

---

## 6. WebSocket (moltbots) – only when using `npm run dev:ws`

- [ ] Run `npm run simulate:agent` in another terminal (with dev:ws on 3000)  
- [ ] Script: GET /api/matches → WS connect → join → receive state → send move → exit  
- [ ] In Watch tab, a live match may appear; **Watch** opens spectator view with updating state  

---

## Quick commands

```bash
cd basestrike
npm run build          # build
npm run start          # serve on :3000 (no WS)
npm run dev:ws         # dev + WebSocket (free port 3000 first)
npm run simulate:agent # agent sim (run after dev:ws)
```
