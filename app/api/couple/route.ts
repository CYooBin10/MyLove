import { prisma } from "@/lib/db";
import { jsonError, ok, parseJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/require-auth";
import { coupleUpdateSchema } from "@/lib/validations/couple";

export async function GET() {
  try {
    const { couple } = await requireAuth();
    const { safeCouple } = await import("@/lib/safe-data");
    const data = await prisma.couple.findUnique({
      where: { id: couple.id },
      include: { users: { orderBy: { slot: "asc" } }, settings: true },
    });
    if (!data) throw new Error("Couple not found");
    return ok({ couple: safeCouple(data) });
  } catch (err) {
    return jsonError(err);
  }
}

export async function PATCH(request: Request) {
  try {
    const { couple } = await requireAuth();
    const data = await parseJson(request, coupleUpdateSchema);

    const { safeCouple } = await import("@/lib/safe-data");

    const updated = await prisma.$transaction(async (tx) => {
      await tx.couple.update({
        where: { id: couple.id },
        data: {
          displayName: data.displayName,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          avatarUrl: data.avatarUrl,
          appName: data.appName,
          theme: data.theme,
        },
      });

      if (data.appName || data.theme) {
        await tx.settings.upsert({
          where: { coupleId: couple.id },
          update: { appName: data.appName, theme: data.theme },
          create: { coupleId: couple.id, appName: data.appName || couple.appName, theme: data.theme || "system" },
        });
      }

      const res = await tx.couple.findUnique({
        where: { id: couple.id },
        include: { users: { orderBy: { slot: "asc" } }, settings: true },
      });
      if (!res) throw new Error("Transaction failed");
      return safeCouple(res);
    });

    return ok({ couple: updated });
  } catch (err) {
    return jsonError(err);
  }
}
