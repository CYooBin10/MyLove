import { prisma } from "@/lib/db";
import { ApiError, jsonError, ok, parseJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/require-auth";
import { specialDaySchema } from "@/lib/validations/special-day";

async function ensureSpecialDay(id: string, coupleId: string) {
  const specialDay = await prisma.specialDay.findUnique({ where: { id } });
  if (!specialDay || specialDay.coupleId !== coupleId) throw new ApiError("Không tìm thấy ngày đặc biệt.", 404);
  return specialDay;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { couple } = await requireAuth();
    const { id } = await params;
    await ensureSpecialDay(id, couple.id);
    const data = await parseJson(request, specialDaySchema);
    const specialDay = await prisma.specialDay.update({
      where: { id },
      data: { title: data.title, date: new Date(data.date), type: data.type, note: data.note, repeatsYearly: data.repeatsYearly },
    });
    return ok({ specialDay });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { couple } = await requireAuth();
    const { id } = await params;
    await ensureSpecialDay(id, couple.id);
    await prisma.specialDay.delete({ where: { id } });
    return ok({ success: true });
  } catch (err) {
    return jsonError(err);
  }
}
