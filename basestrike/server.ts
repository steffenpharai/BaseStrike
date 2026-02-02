/**
 * Custom server: Next.js HTTP + WebSocket on /ws for moltbots.
 * Run: npx tsx server.ts (or node server.js after build).
 * Shares in-memory match store with GET /api/matches.
 */
import http from "http";
import next from "next";
import { WebSocketServer } from "ws";
import {
  getMatch,
  getStateSnapshot,
  addPlayerToMatch,
  processAction,
  createMatch,
  listMatches,
} from "./lib/game/match-server";
import type { PlayerAction } from "./lib/game/schemas";
import { PlayerActionSchema } from "./lib/game/schemas";
import { MAX_PLAYERS_PER_TEAM } from "./lib/game/constants";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev });
const handle = app.getRequestHandler();

const connectionsByMatch = new Map<string, Set<{ ws: import("ws").WebSocket; playerId: string }>>();

function broadcastState(matchId: string): void {
  const snapshot = getStateSnapshot(matchId);
  if (!snapshot) return;
  const set = connectionsByMatch.get(matchId);
  if (!set) return;
  const msg = JSON.stringify({ type: "state", data: snapshot });
  for (const { ws } of set) {
    if (ws.readyState === ws.OPEN) ws.send(msg);
  }
}

function assignTeam(matchId: string): "ethereum" | "solana" | null {
  const match = getMatch(matchId);
  if (!match || match.finishedAt != null) return null;
  let eth = 0,
    sol = 0;
  for (const p of match.state.players.values()) {
    if (p.team === "ethereum") eth++;
    else sol++;
  }
  if (eth >= MAX_PLAYERS_PER_TEAM && sol >= MAX_PLAYERS_PER_TEAM) return null;
  return eth <= sol ? "ethereum" : "solana";
}

app.prepare().then(() => {
  const server = http.createServer((req, res) => handle(req, res));

  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    const url = req.url || "";
    if (!url.startsWith("/ws")) {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const matchId = url.searchParams.get("matchId") || undefined;
    const agentId = url.searchParams.get("agentId") || `agent_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const displayName = url.searchParams.get("displayName") || agentId;

    let resolvedMatchId = matchId;
    let playerId: string | null = null;
    let team: "ethereum" | "solana" | null = null;

    function send(msg: object) {
      if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
    }

    function joinMatch(mid: string) {
      team = assignTeam(mid);
      if (team === null) {
        send({ type: "error", code: "match_full", message: "Match has no slots" });
        return;
      }
      const ok = addPlayerToMatch(mid, agentId, displayName, team);
      if (!ok) {
        send({ type: "error", code: "join_failed", message: "Could not join match" });
        return;
      }
      playerId = agentId;
      resolvedMatchId = mid;
      const set = connectionsByMatch.get(mid) || new Set();
      set.add({ ws, playerId: agentId });
      connectionsByMatch.set(mid, set);
      send({ type: "joined", matchId: mid, team, playerId: agentId });
      broadcastState(mid);
    }

    if (resolvedMatchId) {
      joinMatch(resolvedMatchId);
    } else {
      const summaries = listMatches();
      const open = summaries.find((s) => s.status === "open");
      if (open) {
        joinMatch(open.matchId);
      } else {
        const newMatchId = createMatch("practice");
        joinMatch(newMatchId);
      }
    }

    ws.on("message", (raw) => {
      if (!resolvedMatchId || !playerId) return;
      try {
        const data = JSON.parse(raw.toString());
        if (data.type === "join" && data.matchId) {
          if (resolvedMatchId) {
            send({ type: "error", code: "already_joined", message: "Already in a match" });
            return;
          }
          joinMatch(data.matchId);
          return;
        }
        if (data.type === "action" && data.action) {
          const parsed = PlayerActionSchema.safeParse({ ...data.action, playerId });
          if (!parsed.success) {
            send({ type: "error", code: "invalid_action", message: parsed.error.message });
            return;
          }
          const action = parsed.data as PlayerAction;
          const ok = processAction(resolvedMatchId, action);
          if (ok) broadcastState(resolvedMatchId);
        }
      } catch {
        send({ type: "error", code: "invalid_message", message: "Invalid JSON" });
      }
    });

    ws.on("close", () => {
      if (resolvedMatchId && playerId) {
        const set = connectionsByMatch.get(resolvedMatchId);
        if (set) {
          for (const entry of set) {
            if (entry.playerId === playerId) {
              set.delete(entry);
              break;
            }
          }
          if (set.size === 0) connectionsByMatch.delete(resolvedMatchId);
        }
      }
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port} (Next.js + WebSocket /ws)`);
  });
});
