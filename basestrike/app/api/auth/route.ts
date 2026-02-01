/**
 * Authentication API Route
 * Handles Quick Auth token verification
 * Reference: https://docs.base.org/building-with-base/mini-apps/authentication
 */
import { NextRequest, NextResponse } from "next/server";
import { QuickAuthTokenSchema } from "@/lib/schemas";
import { verifyQuickAuthToken, createSessionToken } from "@/lib/auth/quickauth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = QuickAuthTokenSchema.parse(body);

    // Verify the Quick Auth token
    const user = await verifyQuickAuthToken(token);

    // Create session token
    const sessionToken = await createSessionToken(user);

    return NextResponse.json({
      success: true,
      user: {
        fid: user.fid,
        username: user.username,
      },
      sessionToken,
    });
  } catch (error) {
    console.error("Auth error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}
