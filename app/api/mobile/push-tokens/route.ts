import { prisma } from "@/lib/db";
import { jsonError, ok, parseJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/require-auth";
import { pushTokenSchema } from "@/lib/validations/mobile";

export async function GET() {
  try {
    const { user } = await requireAuth();
    const devices = await prisma.pushDevice.findMany({
      where: { userId: user.id },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        provider: true,
        platform: true,
        deviceId: true,
        status: true,
        permissionStatus: true,
        appVersion: true,
        lastSeenAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return ok({ success: true, data: devices });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireAuth();
    const data = await parseJson(request, pushTokenSchema);
    const now = new Date();

    const record = await prisma.$transaction(async (tx) => {
      await tx.pushDevice.updateMany({
        where: { token: data.token, NOT: { userId: user.id } },
        data: {
          status: "inactive",
          deactivatedAt: now,
          lastErrorCode: "REBOUND_TO_ANOTHER_USER",
        },
      });

      return tx.pushDevice.upsert({
        where: {
          userId_deviceId_provider: {
            userId: user.id,
            deviceId: data.deviceId,
            provider: data.provider,
          },
        },
        create: {
          userId: user.id,
          provider: data.provider,
          token: data.token,
          platform: data.platform,
          deviceId: data.deviceId,
          appVersion: data.appVersion ?? null,
          permissionStatus: data.permissionStatus ?? "unknown",
          status: "active",
          lastSeenAt: now,
          tokenUpdatedAt: now,
        },
        update: {
          token: data.token,
          platform: data.platform,
          appVersion: data.appVersion ?? null,
          permissionStatus: data.permissionStatus ?? "unknown",
          status: "active",
          lastSeenAt: now,
          tokenUpdatedAt: now,
          deactivatedAt: null,
          lastErrorCode: null,
        },
      });
    });

    console.info("[push-device] upsert", { userId: user.id, deviceId: data.deviceId, platform: data.platform, status: record.status });

    return ok({
      success: true,
      data: {
        id: record.id,
        status: record.status,
        lastSeenAt: record.lastSeenAt,
      },
    });
  } catch (err) {
    return jsonError(err);
  }
}
