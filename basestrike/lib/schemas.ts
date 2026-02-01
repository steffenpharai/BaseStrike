import { z } from "zod";

/**
 * Quick Auth Schema
 */
export const QuickAuthTokenSchema = z.object({
  token: z.string(),
});

/**
 * Webhook Event Schema
 */
export const WebhookEventSchema = z.object({
  type: z.enum([
    "miniapp_added",
    "miniapp_removed",
    "notification_delivered",
    "notification_clicked",
  ]),
  timestamp: z.number(),
  data: z.object({
    fid: z.number(),
    appFid: z.number(),
    notificationToken: z.string().optional(),
    notificationUrl: z.string().url().optional(),
  }),
});

/**
 * Beta signup: client sends Quick Auth token; server verifies and adds by fid.
 */
export const BetaSignupTokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});
