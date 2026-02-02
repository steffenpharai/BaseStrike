/**
 * Simulate a moltbot agent: GET /api/matches, connect to WS, send actions.
 * Run with WebSocket server: npm run dev:ws (then in another terminal: node scripts/simulate-agent.js)
 * BASE_URL defaults to http://localhost:3000
 */
const WebSocket = require("ws");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const WS_URL = BASE_URL.replace(/^http/, "ws") + "/ws";

async function main() {
  console.log("1. GET /api/matches...");
  const res = await fetch(`${BASE_URL}/api/matches`);
  if (!res.ok) throw new Error(`matches failed: ${res.status}`);
  const { matches } = await res.json();
  console.log("   matches:", matches?.length ?? 0);
  const open = matches?.find((m) => m.status === "open");
  const matchId = open?.matchId;

  console.log("2. Connect to WebSocket...");
  const agentId = `test_agent_${Date.now()}`;
  const url = matchId ? `${WS_URL}?matchId=${matchId}&agentId=${agentId}` : `${WS_URL}?agentId=${agentId}`;
  const ws = new WebSocket(url);

  const receivedJoined = new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout waiting for joined")), 5000);
    ws.on("message", (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.type === "joined") {
        clearTimeout(t);
        resolve(msg);
      }
      if (msg.type === "error") {
        clearTimeout(t);
        reject(new Error(msg.message || msg.code));
      }
    });
  });

  const receivedState = new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout waiting for state")), 5000);
    ws.on("message", (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.type === "state") {
        clearTimeout(t);
        resolve(msg.data);
      }
    });
  });

  await new Promise((resolve, reject) => {
    ws.on("open", resolve);
    ws.on("error", reject);
  });

  const joined = await receivedJoined;
  console.log("   joined:", joined.matchId, joined.team, joined.playerId);

  const state = await receivedState;
  console.log("   state received, players:", state?.players?.length ?? 0);

  const tick = state?.tickNumber ?? 0;
  const action = {
    type: "move",
    playerId: joined.playerId,
    position: { x: 300, y: 300 },
    tick: tick + 1,
  };
  console.log("3. Send action (move)...");
  ws.send(JSON.stringify({ type: "action", action }));

  const state2 = await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout waiting for state after action")), 3000);
    ws.on("message", (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.type === "state") {
        clearTimeout(t);
        resolve(msg.data);
      }
    });
  });
  console.log("   state after action, tick:", state2?.tickNumber);

  ws.close();
  console.log("Done. Agent simulation passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
