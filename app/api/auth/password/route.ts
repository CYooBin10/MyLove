import { z } from "zod";
import { prisma } from "@/lib/db";
import { ApiError, jsonError, ok, parseJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/require-auth";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";

const schema = z.object({
  target: z.enum(["user", "couple"]),
  currentPassword: z.string().min(4),
  newPassword: z.string().min(4),
});

export async function PATCH(request: Request) {
  try {
    const { user, couple } = await requireAuth();
    const data = await parseJson(request, schema);

    if (data.target === "couple") {
      const match = await verifyPassword(data.currentPassword, couple.codeHash);
      if (!match) throw new ApiError("Mã cặp đôi hiện tại không đúng.", 400);
      await prisma.couple.update({ where: { id: couple.id }, data: { codeHash: await hashPassword(data.newPassword) } });
      return ok({ success: true });
    }

    const match = await verifyPassword(data.currentPassword, user.passwordHash);
    if (!match) throw new ApiError("Mật khẩu hiện tại không đúng.", 400);
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(data.newPassword), sessionVersion: { increment: 1 } },
    });
    await setSessionCookie({ userId: updated.id, coupleId: updated.coupleId, sessionVersion: updated.sessionVersion });
    return ok({ success: true });
  } catch (err) {
    return jsonError(err);
  }
}
