import { z } from "zod";

const permissionStatusSchema = z.enum(["unknown", "granted", "denied", "blocked", "unavailable"]);

export const pushTokenSchema = z.object({
  provider: z.literal("fcm").default("fcm"),
  token: z.string().min(20, "Push token không hợp lệ."),
  platform: z.enum(["android", "ios"]),
  deviceId: z.string().min(1).max(191),
  appVersion: z.string().max(32).optional().nullable(),
  permissionStatus: permissionStatusSchema.optional().nullable(),
});

export const deactivatePushTokenSchema = z.object({
  deviceId: z.string().min(1).max(191),
  token: z.string().min(20).optional(),
  reason: z.string().min(1).max(64).default("logout"),
});

export const internalPushSendSchema = z.object({
  eventId: z.string().min(1),
  event: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(240),
  data: z.record(z.string()).default({}),
});
