import { prisma } from "@/lib/db";
import { jsonError, ok, parseJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/require-auth";
import { deactivatePushTokenSchema } from "@/lib/validations/mobile";

export async function POST(request: Request) {
  try {
    const { user } = await requireAuth();
    const data = await parseJson(request, deactivatePushTokenSchema);

    const result = await prisma.pushDevice.updateMany({
      where: {
        userId: user.id,
        deviceId: data.deviceId,
        ...(data.token ? { token: data.token } : {}),
        status: "active",
      },
      data: {
        status: "inactive",
        deactivatedAt: new Date(),
        lastErrorCode: `DEACTIVATED:${data.reason}`,
      },
    });

    console.info("[push-device] deactivate", { userId: user.id, deviceId: data.deviceId, count: result.count });

    return ok({ success: true, data: { deactivated: result.count } });
  } catch (err) {
    return jsonError(err);
  }
}
