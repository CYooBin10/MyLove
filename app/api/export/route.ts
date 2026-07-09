import { prisma } from "@/lib/db";
import { jsonError, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth/require-auth";

export async function GET() {
  try {
    const { couple } = await requireAuth();

    const data = await prisma.couple.findUnique({
      where: { id: couple.id },
      include: {
        users: { select: { id: true, name: true, nickname: true, slot: true, birthday: true, favoriteColor: true, noteAbout: true, avatarUrl: true } },
        memories: true,
        loveNotes: true,
        tingTings: true,
        specialDays: true,
        gallery: true,
        settings: true,
      },
    });

    return ok(data);
  } catch (err) {
    return jsonError(err);
  }
}
