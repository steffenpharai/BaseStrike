/**
 * GET /api/matches/[matchId]/replay — Replay id for a finished match
 * Returns { replayId } if a replay exists for this match; 404 otherwise.
 */
import { NextResponse } from "next/server";
import { getReplayByMatchId } from "@/lib/game/replay-store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    if (!matchId) {
      return NextResponse.json({ error: "matchId required" }, { status: 400 });
    }
    const replay = getReplayByMatchId(matchId);
    if (!replay) {
      return NextResponse.json({ error: "Replay not found" }, { status: 404 });
    }
    return NextResponse.json({ replayId: replay.id, finalScore: replay.finalScore, players: replay.players });
  } catch (e) {
    console.error("[api/matches/[matchId]/replay]", e);
    return NextResponse.json(
      { error: "Failed to get replay" },
      { status: 500 }
    );
  }
}
