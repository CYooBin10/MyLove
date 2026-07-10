import { clearSessionCookie, getSessionFromCookies } from "@/lib/auth/session";
import { ok, jsonError } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies();
    const deviceId = request.headers.get("x-device-id");

    if (session?.userId && deviceId) {
      await prisma.pushDevice.updateMany({
        where: { userId: session.userId, deviceId, status: "active" },
        data: {
          status: "inactive",
          deactivatedAt: new Date(),
          lastErrorCode: "DEACTIVATED:logout",
        },
      });
    }

    await clearSessionCookie();
    return ok({ success: true });
  } catch (err) {
    return jsonError(err);
  }
}
