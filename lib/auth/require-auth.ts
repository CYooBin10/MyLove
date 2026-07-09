import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { getSessionFromCookies } from "@/lib/auth/session";

export async function requireAuth() {
  const session = await getSessionFromCookies();
  if (!session) throw new ApiError("Bạn cần đăng nhập.", 401);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { couple: { include: { settings: true, users: { orderBy: { slot: "asc" } } } } },
  });

  if (!user || user.coupleId !== session.coupleId || user.sessionVersion !== session.sessionVersion) {
    throw new ApiError("Phiên đăng nhập đã hết hạn.", 401);
  }

  return { user, couple: user.couple, session };
}
