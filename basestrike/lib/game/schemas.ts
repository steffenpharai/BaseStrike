import { z } from "zod";

/**
 * Game Schemas
 */
export const Vector2Schema = z.object({
  x: z.number(),
  y: z.number(),
});

export const WeaponTypeSchema = z.enum(["pistol", "rifle", "shotgun"]);
export const UtilityTypeSchema = z.enum(["flashbang", "smoke"]);

export const PlayerActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("move"),
    playerId: z.string(),
    position: Vector2Schema,
    tick: z.number(),
  }),
  z.object({
    type: z.literal("shoot"),
    playerId: z.string(),
    position: Vector2Schema,
    angle: z.number(),
    tick: z.number(),
  }),
  z.object({
    type: z.literal("plant"),
    playerId: z.string(),
    site: z.enum(["A", "B"]),
    tick: z.number(),
  }),
  z.object({
    type: z.literal("defuse"),
    playerId: z.string(),
    tick: z.number(),
  }),
  z.object({
    type: z.literal("buy"),
    playerId: z.string(),
    item: z.union([WeaponTypeSchema, UtilityTypeSchema]),
    tick: z.number(),
  }),
]);

export const RoundStateSchema = z.object({
  roundNumber: z.number(),
  phase: z.enum(["buy", "active", "planted", "ended"]),
  ethereumAlive: z.number(),
  solanaAlive: z.number(),
  bombPlanted: z.boolean(),
  winner: z.enum(["ethereum", "solana"]).optional(),
  endReason: z.enum(["elimination", "timeout", "bomb_detonated", "bomb_defused"]).optional(),
});

export const ReplaySchema = z.object({
  id: z.string(),
  matchId: z.string().optional(),
  timestamp: z.number(),
  players: z.array(
    z.object({
      id: z.string(),
      fid: z.number().optional(),
      displayName: z.string(),
      team: z.enum(["ethereum", "solana"]),
    })
  ),
  rounds: z.array(
    z.object({
      roundNumber: z.number(),
      actions: z.array(PlayerActionSchema),
      state: RoundStateSchema,
      duration: z.number(),
    })
  ),
  finalScore: z.object({
    ethereum: z.number(),
    solana: z.number(),
  }),
  matchType: z.enum(["practice", "ranked"]),
});

export type Replay = z.infer<typeof ReplaySchema>;
export type PlayerAction = z.infer<typeof PlayerActionSchema>;
export type RoundState = z.infer<typeof RoundStateSchema>;
