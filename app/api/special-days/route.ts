import { prisma } from "@/lib/db";
import { jsonError, ok, parseJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/require-auth";
import { specialDaySchema } from "@/lib/validations/special-day";

export async function GET() {
  try {
    const { couple } = await requireAuth();
    const specialDays = await prisma.specialDay.findMany({
      where: { coupleId: couple.id },
      orderBy: { date: "asc" },
    });
    return ok({ specialDays });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(request: Request) {
  try {
    const { user, couple } = await requireAuth();
    const data = await parseJson(request, specialDaySchema);
    const specialDay = await prisma.specialDay.create({
      data: {
        coupleId: couple.id,
        createdById: user.id,
        title: data.title,
        date: new Date(data.date),
        type: data.type,
        note: data.note,
        repeatsYearly: data.repeatsYearly,
      },
    });
    return ok({ specialDay }, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}
