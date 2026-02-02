/**
 * GET /api/matches/[matchId]/state — Public match state for spectators
 * Unauthenticated; used by Watch UI to poll live state.
 */
import { NextResponse } from "next/server";
import { getStateSnapshot } from "@/lib/game/match-server";

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
    const state = getStateSnapshot(matchId);
    if (!state) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }
    return NextResponse.json(state);
  } catch (e) {
    console.error("[api/matches/[matchId]/state]", e);
    return NextResponse.json(
      { error: "Failed to get match state" },
      { status: 500 }
    );
  }
}
