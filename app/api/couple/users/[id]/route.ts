import { prisma } from "@/lib/db";
import { ApiError, jsonError, ok, parseJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/require-auth";
import { userUpdateSchema } from "@/lib/validations/couple";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { couple } = await requireAuth();
    const { id } = await params;
    const data = await parseJson(request, userUpdateSchema);

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.coupleId !== couple.id) throw new ApiError("Không tìm thấy người dùng.", 404);

    const { safeUser } = await import("@/lib/safe-data");
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        nickname: data.nickname,
        birthday: data.birthday ? new Date(data.birthday) : data.birthday === null ? null : undefined,
        favoriteColor: data.favoriteColor,
        noteAbout: data.noteAbout,
        avatarUrl: data.avatarUrl,
      },
    });

    return ok({ user: safeUser(user) });
  } catch (err) {
    return jsonError(err);
  }
}
