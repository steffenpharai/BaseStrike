/**
 * Match Server - Authoritative game state management
 * Handles match creation, player actions, and game simulation
 */
import { GAME_CONSTANTS, WEAPON_STATS } from "./constants";
import type { PlayerAction, Replay } from "./schemas";
import type { Player, GameState } from "./types";
import { DEFAULT_MAP, isInSite } from "./map";
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
        attackersAlive: 0,
        defendersAlive: 0,
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
  team: "attackers" | "defenders",
  fid?: number
): boolean {
  const match = getMatch(matchId);
  if (!match) return false;

  const spawns = team === "attackers" ? DEFAULT_MAP.spawns.attackers : DEFAULT_MAP.spawns.defenders;
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
  if (team === "attackers") {
    match.state.roundState.attackersAlive++;
  } else {
    match.state.roundState.defendersAlive++;
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

    const targetAngle = Math.atan2(dy, dx);
    const angleDiff = Math.abs(targetAngle - action.angle);

    // Hit if within 0.2 radians (~11 degrees)
    if (angleDiff < 0.2 || angleDiff > Math.PI * 2 - 0.2) {
      target.health = Math.max(0, target.health - weapon.damage);

      if (target.health <= 0) {
        target.alive = false;
        if (target.team === "attackers") {
          match.state.roundState.attackersAlive--;
        } else {
          match.state.roundState.defendersAlive--;
        }

        checkRoundEnd(match);
      }
    }
  }
}

function handlePlant(match: Match, player: Player, action: PlayerAction & { type: "plant" }): void {
  if (player.team !== "attackers") return;
  if (!isInSite(player.position, action.site)) return;

  match.state.bombSite = action.site;
  match.state.bombPosition = { ...player.position };
  match.state.roundState.bombPlanted = true;
  match.state.roundState.phase = "planted";
}

function handleDefuse(match: Match, player: Player): void {
  if (player.team !== "defenders") return;
  if (!match.state.bombPosition) return;

  const dx = player.position.x - match.state.bombPosition.x;
  const dy = player.position.y - match.state.bombPosition.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < 50) {
    match.state.defuseProgress += 1;

    if (match.state.defuseProgress >= GAME_CONSTANTS.DEFUSE_TIME * GAME_CONSTANTS.TICK_RATE) {
      endRound(match, "defenders", "bomb_defused");
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

  if (state.attackersAlive === 0) {
    endRound(match, "defenders", "elimination");
  } else if (state.defendersAlive === 0) {
    endRound(match, "attackers", "elimination");
  }
}

function endRound(
  match: Match,
  winner: "attackers" | "defenders",
  reason: "elimination" | "timeout" | "bomb_detonated" | "bomb_defused"
): void {
  match.state.roundState.winner = winner;
  match.state.roundState.endReason = reason;
  match.state.roundState.phase = "ended";

  // Check if match is over
  const roundsWon = countRoundsWon(match);
  if (roundsWon.attackers >= GAME_CONSTANTS.ROUNDS_TO_WIN || roundsWon.defenders >= GAME_CONSTANTS.ROUNDS_TO_WIN) {
    endMatch(match);
  }
}

function countRoundsWon(_match: Match): { attackers: number; defenders: number } {
  // Count from actions history
  // Simplified for MVP
  return { attackers: 0, defenders: 0 };
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
      attackers: 3,
      defenders: 2,
    },
    matchType: match.matchType,
  };

  storeReplay(replay);
}
