/**
 * Beta tester signup API (cap 100).
 * POST: send Quick Auth token; server verifies and adds by fid.
 * GET: public count and full status for UI.
 * Ref: https://docs.base.org/mini-apps/quickstart/building-for-the-base-app — low friction, Farcaster identity.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BetaSignupTokenSchema } from "@/lib/schemas";
import { verifyQuickAuthToken } from "@/lib/auth/quickauth";
import * as betaStore from "@/lib/beta-signup/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = betaStore.getBetaSignupCount();
    const full = betaStore.isBetaFull();
    return NextResponse.json({ count, full, cap: betaStore.BETA_SIGNUP_CAP });
  } catch (e) {
    console.error("Beta signup GET error:", e);
    return NextResponse.json(
      { error: "Failed to get beta status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = BetaSignupTokenSchema.parse(body);

    const user = await verifyQuickAuthToken(token);
    const result = betaStore.addBetaSignup(user.fid, user.username);

    if (result === "added") {
      return NextResponse.json({
        success: true,
        added: true,
        count: betaStore.getBetaSignupCount(),
        cap: betaStore.BETA_SIGNUP_CAP,
      });
    }
    if (result === "already") {
      return NextResponse.json({
        success: true,
        alreadySignedUp: true,
        count: betaStore.getBetaSignupCount(),
        cap: betaStore.BETA_SIGNUP_CAP,
      });
    }
    return NextResponse.json(
      { success: false, full: true, error: "Beta list is full" },
      { status: 409 }
    );
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request: token required" },
        { status: 400 }
      );
    }
    console.error("Beta signup POST error:", e);
    return NextResponse.json(
      { error: "Authentication failed or server error" },
      { status: 401 }
    );
  }
}
