/**
 * Match Server - Authoritative game state management
 * Handles match creation, player actions, and game simulation
 */
import { GAME_CONSTANTS, WEAPON_STATS } from "./constants";
import type { PlayerAction, Replay } from "./schemas";
import type { Player, GameState } from "./types";
import { DEFAULT_MAP, isInSite, segmentIntersectsWall } from "./map";
import { generateReplayId, storeReplay } from "./replay-store";

interface Match {
  id: string;
  state: GameState;
  actions: PlayerAction[];
  createdAt: number;
  matchType: "practice" | "ranked";
}

// In-memory match store
const matches = new Map<string, Match>();

export function createMatch(matchType: "practice" | "ranked" = "practice"): string {
  const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const match: Match = {
    id: matchId,
    state: {
      matchId,
      players: new Map(),
      roundNumber: 1,
      roundState: {
        roundNumber: 1,
        phase: "buy",
        ethereumAlive: 0,
        solanaAlive: 0,
        bombPlanted: false,
      },
      tickNumber: 0,
      bombSite: null,
      bombPosition: null,
      defuseProgress: 0,
    },
    actions: [],
    createdAt: Date.now(),
    matchType,
  };

  matches.set(matchId, match);
  return matchId;
}

export function getMatch(matchId: string): Match | null {
  return matches.get(matchId) || null;
}

export function addPlayerToMatch(
  matchId: string,
  playerId: string,
  displayName: string,
  team: "ethereum" | "solana",
  fid?: number
): boolean {
  const match = getMatch(matchId);
  if (!match) return false;

  const spawns = team === "ethereum" ? DEFAULT_MAP.spawns.ethereum : DEFAULT_MAP.spawns.solana;
  const spawnIndex = match.state.players.size % spawns.length;
  const spawn = spawns[spawnIndex];

  const player: Player = {
    id: playerId,
    fid,
    displayName,
    team,
    position: { ...spawn },
    health: 100,
    alive: true,
    weapon: "pistol",
    utilities: [],
    money: 800,
  };

  match.state.players.set(playerId, player);

  // Update alive counts
  if (team === "ethereum") {
    match.state.roundState.ethereumAlive++;
  } else {
    match.state.roundState.solanaAlive++;
  }

  return true;
}

export function processAction(matchId: string, action: PlayerAction): boolean {
  const match = getMatch(matchId);
  if (!match) return false;

  match.actions.push(action);
  match.state.tickNumber = action.tick;

  const player = match.state.players.get(action.playerId);
  if (!player || !player.alive) return false;

  switch (action.type) {
    case "move":
      player.position = action.position;
      break;

    case "shoot":
      handleShoot(match, player, action);
      break;

    case "plant":
      handlePlant(match, player, action);
      break;

    case "defuse":
      handleDefuse(match, player);
      break;

    case "buy":
      handleBuy(match, player, action);
      break;
  }

  return true;
}

function handleShoot(match: Match, shooter: Player, action: PlayerAction & { type: "shoot" }): void {
  const weapon = WEAPON_STATS[shooter.weapon];
  const maxRange = weapon.range;

  // Simple raycast hit detection
  for (const [id, target] of match.state.players) {
    if (id === shooter.id || !target.alive || target.team === shooter.team) continue;

    const dx = target.position.x - action.position.x;
    const dy = target.position.y - action.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > maxRange) continue;

    // Block shot if any wall is between shooter and target
    if (segmentIntersectsWall(action.position, target.position)) continue;

    const targetAngle = Math.atan2(dy, dx);
    const angleDiff = Math.abs(targetAngle - action.angle);

    // Hit if within 0.2 radians (~11 degrees)
    if (angleDiff < 0.2 || angleDiff > Math.PI * 2 - 0.2) {
      target.health = Math.max(0, target.health - weapon.damage);

      if (target.health <= 0) {
        target.alive = false;
        if (target.team === "ethereum") {
          match.state.roundState.ethereumAlive--;
        } else {
          match.state.roundState.solanaAlive--;
        }

        checkRoundEnd(match);
      }
    }
  }
}

function handlePlant(match: Match, player: Player, action: PlayerAction & { type: "plant" }): void {
  if (player.team !== "solana") return;
  if (!isInSite(player.position, action.site)) return;

  match.state.bombSite = action.site;
  match.state.bombPosition = { ...player.position };
  match.state.roundState.bombPlanted = true;
  match.state.roundState.phase = "planted";
}

function handleDefuse(match: Match, player: Player): void {
  if (player.team !== "ethereum") return;
  if (!match.state.bombPosition) return;

  const dx = player.position.x - match.state.bombPosition.x;
  const dy = player.position.y - match.state.bombPosition.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 50) {
    match.state.defuseProgress += 1;

    if (match.state.defuseProgress >= GAME_CONSTANTS.DEFUSE_TIME * GAME_CONSTANTS.TICK_RATE) {
      endRound(match, "ethereum", "bomb_defused");
    }
  } else {
    match.state.defuseProgress = 0;
  }
}

function handleBuy(match: Match, player: Player, action: PlayerAction & { type: "buy" }): void {
  if (match.state.roundState.phase !== "buy") return;

  const item = action.item;
  let cost = 0;

  if (item in WEAPON_STATS) {
    cost = WEAPON_STATS[item as keyof typeof WEAPON_STATS].cost;
    if (player.money >= cost) {
      player.weapon = item as Player["weapon"];
      player.money -= cost;
    }
  }
}

function checkRoundEnd(match: Match): void {
  const state = match.state.roundState;

  if (state.ethereumAlive === 0) {
    endRound(match, "solana", "elimination");
  } else if (state.solanaAlive === 0) {
    endRound(match, "ethereum", "elimination");
  }
}

function endRound(
  match: Match,
  winner: "ethereum" | "solana",
  reason: "elimination" | "timeout" | "bomb_detonated" | "bomb_defused"
): void {
  match.state.roundState.winner = winner;
  match.state.roundState.endReason = reason;
  match.state.roundState.phase = "ended";

  // Check if match is over
  const roundsWon = countRoundsWon(match);
  if (roundsWon.ethereum >= GAME_CONSTANTS.ROUNDS_TO_WIN || roundsWon.solana >= GAME_CONSTANTS.ROUNDS_TO_WIN) {
    endMatch(match);
  }
}

function countRoundsWon(_match: Match): { ethereum: number; solana: number } {
  // Count from actions history
  // Simplified for MVP
  return { ethereum: 0, solana: 0 };
}

function endMatch(match: Match): void {
  // Generate replay
  const replay: Replay = {
    id: generateReplayId(),
    timestamp: Date.now(),
    players: Array.from(match.state.players.values()).map((p) => ({
      id: p.id,
      fid: p.fid,
      displayName: p.displayName,
      team: p.team,
    })),
    rounds: [], // Simplified - would parse from actions
    finalScore: {
      ethereum: 3,
      solana: 2,
    },
    matchType: match.matchType,
  };

  storeReplay(replay);
}
