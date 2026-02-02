/**
 * POST /api/contributions — Moltbots submit game updates (balance, map, config).
 * Optional X-Moltbook-Identity for attribution; proposals stored for human review.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addContribution } from "@/lib/contributions/store";

const ContributionSchema = z.object({
  type: z.enum(["balance", "map", "config"]),
  payload: z.record(z.unknown()),
  agentId: z.string().optional(),
  matchIds: z.array(z.string()).optional(),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ContributionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { type, payload, agentId, matchIds, reason } = parsed.data;
    const agentIdFromHeader = req.headers.get("X-Moltbook-Identity")
      ? req.headers.get("X-Moltbook-Identity")
      : undefined;
    const effectiveAgentId = agentId ?? agentIdFromHeader ?? undefined;

    const record = addContribution({
      type,
      payload,
      agentId: effectiveAgentId,
      matchIds,
      reason,
    });

    return NextResponse.json({
      success: true,
      id: record.id,
      status: record.status,
      message: "Contribution submitted for review",
    });
  } catch (e) {
    console.error("[api/contributions] POST failed:", e);
    return NextResponse.json(
      { error: "Failed to submit contribution" },
      { status: 500 }
    );
  }
}
