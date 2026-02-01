/**
 * Notification Sender
 * Reference: https://docs.base.org/building-with-base/mini-apps/notifications
 */
import { getNotificationToken } from "./store";

interface SendNotificationParams {
  fid: number;
  appFid: number;
  title: string;
  body: string;
  targetUrl?: string;
}

export async function sendNotification(params: SendNotificationParams): Promise<boolean> {
  const { fid, appFid, title, body, targetUrl } = params;

  // Get notification token for this user
  const tokenData = getNotificationToken(fid, appFid);
  if (!tokenData) {
    console.warn(`No notification token for fid=${fid}, appFid=${appFid}`);
    return false;
  }

  try {
    // Send notification via Base notification endpoint
    const response = await fetch(tokenData.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.token}`,
      },
      body: JSON.stringify({
        title,
        body,
        targetUrl,
      }),
    });

    if (!response.ok) {
      console.error("Failed to send notification:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
}

/**
 * Send welcome notification when user adds the mini app
 */
export async function sendWelcomeNotification(fid: number, appFid: number): Promise<void> {
  await sendNotification({
    fid,
    appFid,
    title: "Welcome to BaseStrike!",
    body: "Get ready for tactical top-down shooter action. Jump into your first match!",
  });
}

/**
 * Send match ready notification
 */
export async function sendMatchReadyNotification(
  fid: number,
  appFid: number,
  matchId: string
): Promise<void> {
  await sendNotification({
    fid,
    appFid,
    title: "Match Ready!",
    body: "Your match is starting. Join now!",
    targetUrl: `${process.env.NEXT_PUBLIC_URL}/match/${matchId}`,
  });
}
