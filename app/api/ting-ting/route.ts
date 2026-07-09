import { prisma } from "@/lib/db";
import { jsonError, ok, parseJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/require-auth";
import { tingTingMarkSchema, tingTingSchema } from "@/lib/validations/ting-ting";

export async function GET(request: Request) {
  try {
    const { user, couple } = await requireAuth();
    const unreadOnly = new URL(request.url).searchParams.get("unread") === "1";
    const { safeUser } = await import("@/lib/safe-data");
    const tingTings = await prisma.tingTing.findMany({
      where: {
        coupleId: couple.id,
        ...(unreadOnly
          ? { senderId: { not: user.id }, readAt: null, OR: [{ receiverId: null }, { receiverId: user.id }] }
          : {}),
      },
      include: { sender: true },
      orderBy: { createdAt: "desc" },
      take: unreadOnly ? 50 : 100,
    });
    return ok({ tingTings: tingTings.map(t => ({ ...t, sender: safeUser(t.sender) })) });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(request: Request) {
  try {
    const { user, couple } = await requireAuth();
    const data = await parseJson(request, tingTingSchema);
    const partner = couple.users.find((u) => u.id !== user.id);
    const { safeUser } = await import("@/lib/safe-data");
    const tingTing = await prisma.tingTing.create({
      data: {
        coupleId: couple.id,
        senderId: user.id,
        receiverId: partner?.id ?? null,
        type: data.type,
        message: data.message,
      },
      include: { sender: true },
    });
    return ok({ tingTing: { ...tingTing, sender: safeUser(tingTing.sender) } }, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, couple } = await requireAuth();
    const data = await parseJson(request, tingTingMarkSchema);
    await prisma.tingTing.updateMany({
      where: {
        coupleId: couple.id,
        senderId: { not: user.id },
        readAt: null,
        OR: [{ receiverId: null }, { receiverId: user.id }],
        ...(data.ids?.length ? { id: { in: data.ids } } : {}),
      },
      data: { readAt: new Date() },
    });
    return ok({ success: true });
  } catch (err) {
    return jsonError(err);
  }
}
