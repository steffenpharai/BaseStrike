/**
 * GET /api/matches — Public match list for moltbots and humans
 * Unauthenticated; agents use it to find joinable matches; humans use it for Watch/Bet UI.
 */
import { NextResponse } from "next/server";
import { listMatches } from "@/lib/game/match-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const matches = listMatches();
    return NextResponse.json({ matches });
  } catch (e) {
    console.error("[api/matches] listMatches failed:", e);
    return NextResponse.json(
      { error: "Failed to list matches" },
      { status: 500 }
    );
  }
}
