import { prisma } from "@/lib/db";
import { parseJson, ok, jsonError, ApiError } from "@/lib/api";
import { loginSchema } from "@/lib/validations/auth";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const data = await parseJson(request, loginSchema);

    const couple = await prisma.couple.findFirst({
      include: { users: { orderBy: { slot: "asc" } } },
    });

    if (!couple || couple.users.length < 2) {
      throw new ApiError("Ứng dụng chưa được thiết lập. Hãy truy cập /setup.", 400);
    }

    const user = couple.users.find((u) => u.slot === data.slot);
    if (!user) {
      throw new ApiError("Người dùng không tồn tại.", 404);
    }

    let isMatch = false;
    if (data.useCoupleCode) {
      isMatch = await verifyPassword(data.password, couple.codeHash);
    } else {
      isMatch = await verifyPassword(data.password, user.passwordHash);
    }

    if (!isMatch) {
      throw new ApiError("Mật khẩu không chính xác.", 400);
    }

    // Set cookie session
    await setSessionCookie({
      userId: user.id,
      coupleId: couple.id,
      sessionVersion: user.sessionVersion,
    });

    // Update lastSeenAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
    });

    return ok({ success: true, user: { id: user.id, name: user.name, slot: user.slot } });
  } catch (err) {
    return jsonError(err);
  }
}
