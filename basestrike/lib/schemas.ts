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
