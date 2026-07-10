import { createHash } from "crypto";
import { SignJWT, importPKCS8 } from "jose";
import { prisma } from "@/lib/db";

type PushSendInput = {
  eventId: string;
  event: string;
  userId: string;
  title: string;
  body: string;
  data: Record<string, string>;
};

type TokenResponse = {
  access_token: string;
  expires_in: number;
};

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

function getFirebaseConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Thiếu FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL hoặc FIREBASE_PRIVATE_KEY.");
  }

  return { projectId, clientEmail, privateKey };
}

async function getAccessToken() {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedAccessToken.token;
  }

  const { clientEmail, privateKey } = getFirebaseConfig();
  const key = await importPKCS8(privateKey, "RS256");
  const now = Math.floor(Date.now() / 1000);
  const assertion = await new SignJWT({ scope: "https://www.googleapis.com/auth/firebase.messaging" })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(clientEmail)
    .setSubject(clientEmail)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });

  if (!response.ok) throw new Error(await response.text());

  const data = (await response.json()) as TokenResponse;
  cachedAccessToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

function sanitizeData(data: Record<string, string>) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value)]));
}

function isInvalidTokenError(status: number, text: string) {
  return status === 404 || text.includes("UNREGISTERED") || text.includes("INVALID_ARGUMENT") || text.includes("not a valid FCM registration token");
}

export async function sendPushNotification(input: PushSendInput) {
  const devices = await prisma.pushDevice.findMany({
    where: { userId: input.userId, status: "active" },
    select: { id: true, token: true },
  });

  if (!devices.length) return { sent: 0, failed: 0, invalid: 0, skipped: true as const };

  const { projectId } = getFirebaseConfig();
  const accessToken = await getAccessToken();
  const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
  const payloadData = sanitizeData({
    notificationId: input.eventId,
    eventId: input.eventId,
    event: input.event,
    ...input.data,
  });

  const results = await Promise.all(
    devices.map(async (device) => {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: {
            token: device.token,
            notification: { title: input.title, body: input.body },
            data: payloadData,
            android: { priority: "HIGH" },
            apns: { headers: { "apns-priority": "10" } },
          },
        }),
      });

      if (response.ok) return { deviceId: device.id, ok: true, invalid: false, error: null as string | null };

      const text = await response.text();
      return { deviceId: device.id, ok: false, invalid: isInvalidTokenError(response.status, text), error: text.slice(0, 300) };
    })
  );

  const sentIds = results.filter((result) => result.ok).map((result) => result.deviceId);
  const invalidIds = results.filter((result) => result.invalid).map((result) => result.deviceId);

  if (sentIds.length) {
    await prisma.pushDevice.updateMany({
      where: { id: { in: sentIds } },
      data: { lastSentAt: new Date(), lastErrorCode: null },
    });
  }

  if (invalidIds.length) {
    await prisma.pushDevice.updateMany({
      where: { id: { in: invalidIds } },
      data: { status: "inactive", deactivatedAt: new Date(), lastErrorCode: "FCM_TOKEN_INVALID" },
    });
  }

  const failed = results.filter((result) => !result.ok).length;
  const invalid = invalidIds.length;
  console.info("[push] send result", { eventId: input.eventId, userId: input.userId, sent: sentIds.length, failed, invalid });

  return { sent: sentIds.length, failed, invalid, skipped: false as const };
}

export function buildPushPayloadHash(payload: unknown) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}
