/**
 * Beta tester signup store (capped at 100).
 * In production, replace with a database or Vercel KV for persistence across serverless invocations.
 * Ref: Base mini apps – low friction onboarding; use Farcaster identity only.
 */

export const BETA_SIGNUP_CAP = 100;

export interface BetaSignupEntry {
  fid: number;
  username?: string;
  createdAt: number;
}

const store = new Map<number, BetaSignupEntry>();

export function addBetaSignup(fid: number, username?: string): "added" | "full" | "already" {
  if (store.has(fid)) return "already";
  if (store.size >= BETA_SIGNUP_CAP) return "full";
  store.set(fid, { fid, username, createdAt: Date.now() });
  return "added";
}

export function hasSignedUp(fid: number): boolean {
  return store.has(fid);
}

export function getBetaSignupCount(): number {
  return store.size;
}

export function isBetaFull(): boolean {
  return store.size >= BETA_SIGNUP_CAP;
}

/** For admin: list signups (do not expose PII in public API). */
export function listBetaSignups(): BetaSignupEntry[] {
  return Array.from(store.values()).sort((a, b) => a.createdAt - b.createdAt);
}
