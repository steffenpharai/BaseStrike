/**
 * Webhook Endpoint for Mini App Events
 * Reference: https://docs.base.org/building-with-base/mini-apps/notifications
 *
 * CRITICAL: Base app waits for successful webhook response before activating tokens.
 * This endpoint must respond quickly (< 3s). Use async processing for heavy work.
 */
import { NextRequest, NextResponse } from "next/server";
import { WebhookEventSchema } from "@/lib/schemas";
import { storeNotificationToken, removeNotificationToken } from "@/lib/notifications/store";
import { sendWelcomeNotification } from "@/lib/notifications/sender";
import { config } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-farcaster-signature") || "";

    // Verify webhook signature using Neynar (simplified for dev)
    if (config.neynar.apiKey && config.isProduction) {
      // In production, implement proper signature verification
      // using @farcaster/miniapp-node
      console.log("Webhook signature:", signature.substring(0, 20) + "...");
    } else {
      console.warn("Webhook verification skipped in development");
    }

    // Parse event
    const event = JSON.parse(body);
    const validated = WebhookEventSchema.parse(event);

    // Handle event asynchronously but respond immediately
    handleEventAsync(validated).catch((error) => {
      console.error("Error handling webhook event:", error);
    });

    // CRITICAL: Respond immediately (< 3s) for Base app to activate tokens
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/**
 * Handle webhook events asynchronously
 */
async function handleEventAsync(event: { type: string; data: { fid: number; appFid: number; notificationToken?: string; notificationUrl?: string } }): Promise<void> {
  const { type, data } = event;

  switch (type) {
    case "miniapp_added":
      // Store notification token
      if (data.notificationToken && data.notificationUrl) {
        storeNotificationToken({
          fid: data.fid,
          appFid: data.appFid,
          token: data.notificationToken,
          url: data.notificationUrl,
        });

        // Send welcome notification
        await sendWelcomeNotification(data.fid, data.appFid);
      }
      break;

    case "miniapp_removed":
      // Remove notification token
      removeNotificationToken(data.fid, data.appFid);
      break;

    case "notification_delivered":
      console.log(`Notification delivered to fid=${data.fid}`);
      break;

    case "notification_clicked":
      console.log(`Notification clicked by fid=${data.fid}`);
      break;

    default:
      console.warn(`Unknown event type: ${type}`);
  }
}
