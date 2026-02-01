/**
 * Notification Token Storage
 * In production, use a database (Postgres, Redis, etc.)
 */

interface NotificationToken {
  fid: number;
  appFid: number;
  token: string;
  url: string;
  createdAt: number;
}

// In-memory store (replace with database in production)
const tokenStore = new Map<string, NotificationToken>();

function getKey(fid: number, appFid: number): string {
  return `${fid}:${appFid}`;
}

export function storeNotificationToken(data: {
  fid: number;
  appFid: number;
  token: string;
  url: string;
}): void {
  const key = getKey(data.fid, data.appFid);
  tokenStore.set(key, {
    ...data,
    createdAt: Date.now(),
  });
}

export function getNotificationToken(
  fid: number,
  appFid: number
): NotificationToken | null {
  const key = getKey(fid, appFid);
  return tokenStore.get(key) || null;
}

export function removeNotificationToken(fid: number, appFid: number): void {
  const key = getKey(fid, appFid);
  tokenStore.delete(key);
}
