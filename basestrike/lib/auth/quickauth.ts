/**
 * Quick Auth Implementation
 * Reference: https://docs.base.org/building-with-base/mini-apps/authentication
 */
import { config } from "../config";

export interface VerifiedUser {
  fid: number;
  username?: string;
  custody?: string;
}

/**
 * Verify Quick Auth JWT token
 */
export async function verifyQuickAuthToken(token: string): Promise<VerifiedUser> {
  // Development bypass for testing
  if (config.devAuthBypass && config.isDev) {
    console.warn("DEV_AUTH_BYPASS enabled - accepting mock token");
    const mockData = parseMockToken(token);
    if (mockData) {
      return mockData;
    }
  }

  // In production, implement proper JWT verification
  // For now, just parse the token as dev token
  const mockData = parseMockToken(token);
  if (mockData) {
    return mockData;
  }

  throw new Error("Authentication failed - invalid token format");
}

/**
 * Parse mock token for development (format: "dev:fid:username")
 */
function parseMockToken(token: string): VerifiedUser | null {
  if (!token.startsWith("dev:")) return null;

  const parts = token.split(":");
  if (parts.length < 2) return null;

  const fid = parseInt(parts[1]);
  if (isNaN(fid)) return null;

  return {
    fid,
    username: parts[2] || `user${fid}`,
    custody: `0x${fid.toString(16).padStart(40, "0")}`,
  };
}

/**
 * Create session token (simple JWT for demo - use proper session management in production)
 */
export async function createSessionToken(user: VerifiedUser): Promise<string> {
  const { SignJWT } = await import("jose");
  const secret = new TextEncoder().encode(config.session.secret);

  return new SignJWT({ fid: user.fid, username: user.username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

/**
 * Verify session token
 */
export async function verifySessionToken(token: string): Promise<VerifiedUser | null> {
  try {
    const { jwtVerify } = await import("jose");
    const secret = new TextEncoder().encode(config.session.secret);

    const { payload } = await jwtVerify(token, secret);

    return {
      fid: payload.fid as number,
      username: payload.username as string | undefined,
    };
  } catch {
    return null;
  }
}
