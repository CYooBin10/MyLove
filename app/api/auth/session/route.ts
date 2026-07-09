import { prisma } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth/session";
import { ok, jsonError, getDatabaseErrorMessage } from "@/lib/api";

export async function GET() {
  try {
    // Try counting couples, if DB connection fails, catch it and return database error code
    let needsSetup = false;
    try {
      needsSetup = (await prisma.couple.count()) === 0;
    } catch (dbErr) {
      return ok({
        authenticated: false,
        needsSetup: false,
        dbError: true,
        dbErrorMessage: getDatabaseErrorMessage(dbErr) || "Không thể kết nối đến cơ sở dữ liệu.",
      });
    }

    if (needsSetup) {
      return ok({ authenticated: false, needsSetup: true });
    }

    const session = await getSessionFromCookies();
    if (!session) {
      return ok({ authenticated: false, needsSetup: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { couple: { include: { users: { orderBy: { slot: "asc" } }, settings: true } } },
    });

    if (!user || user.coupleId !== session.coupleId || user.sessionVersion !== session.sessionVersion) {
      return ok({ authenticated: false, needsSetup: false });
    }

    const [unreadTingCount, unreadNoteCount] = await Promise.all([
      prisma.tingTing.count({
        where: {
          coupleId: user.coupleId,
          senderId: { not: user.id },
          readAt: null,
          OR: [{ receiverId: null }, { receiverId: user.id }],
        },
      }),
      prisma.loveNote.count({
        where: { coupleId: user.coupleId, senderId: { not: user.id }, readAt: null },
      }),
    ]);

    const { safeUser, safeCouple } = await import("@/lib/safe-data");

    return ok({
      authenticated: true,
      needsSetup: false,
      user: safeUser(user),
      couple: safeCouple(user.couple),
      unread: { tingTing: unreadTingCount, notes: unreadNoteCount },
    });
  } catch (err) {
    return jsonError(err);
  }
}
