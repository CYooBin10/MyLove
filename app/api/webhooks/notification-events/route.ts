import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";
import { ApiError, jsonError, ok } from "@/lib/api";
import { internalPushSendSchema } from "@/lib/validations/mobile";
import { buildPushPayloadHash, sendPushNotification } from "@/lib/push/send-fcm";

function safeCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function verifySignature(rawBody: string, timestamp: string, signatureHeader: string | null) {
  const secret = process.env.MOBILE_WEBHOOK_SECRET;
  if (!secret) throw new ApiError("Thiếu MOBILE_WEBHOOK_SECRET.", 500);
  if (!timestamp || !signatureHeader) throw new ApiError("Thiếu chữ ký webhook.", 401);

  const ts = Number(timestamp) * 1000;
  if (!ts || Math.abs(Date.now() - ts) > 5 * 60 * 1000) {
    throw new ApiError("Webhook timestamp đã hết hạn.", 401);
  }

  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  const received = signatureHeader.replace(/^sha256=/, "");
  if (!safeCompare(expected, received)) throw new ApiError("Chữ ký webhook không hợp lệ.", 401);
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const webhookId = request.headers.get("x-webhook-id") || "";
    verifySignature(rawBody, request.headers.get("x-webhook-timestamp") || "", request.headers.get("x-webhook-signature"));

    const data = internalPushSendSchema.parse(JSON.parse(rawBody));
    const eventId = webhookId || data.eventId;
    const payloadHash = buildPushPayloadHash(data);

    const existing = await prisma.webhookEventReceipt.findUnique({
      where: { source_eventId: { source: "notification-webhook", eventId } },
    });

    if (existing) {
      return ok({ success: true, duplicate: true, data: { status: existing.status } });
    }

    await prisma.webhookEventReceipt.create({
      data: {
        source: "notification-webhook",
        eventId,
        eventType: data.event,
        status: "received",
        payloadHash,
      },
    });

    const result = await sendPushNotification(data);

    await prisma.webhookEventReceipt.update({
      where: { source_eventId: { source: "notification-webhook", eventId } },
      data: { status: "processed", processedAt: new Date() },
    });

    return ok({ success: true, data: result });
  } catch (err) {
    return jsonError(err);
  }
}
