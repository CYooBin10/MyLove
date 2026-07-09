import { prisma } from "@/lib/db";
import { ApiError, jsonError, ok, parseJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/require-auth";
import { memorySchema } from "@/lib/validations/memory";

async function ensureMemory(id: string, coupleId: string) {
  const memory = await prisma.memory.findUnique({ where: { id }, include: { createdBy: true } });
  if (!memory || memory.coupleId !== coupleId) throw new ApiError("Không tìm thấy kỷ niệm.", 404);
  return memory;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { couple } = await requireAuth();
    const { id } = await params;
    const { safeUser } = await import("@/lib/safe-data");
    const memory = await ensureMemory(id, couple.id);
    return ok({ memory: { ...memory, createdBy: safeUser(memory.createdBy) } });
  } catch (err) {
    return jsonError(err);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { couple } = await requireAuth();
    const { id } = await params;
    await ensureMemory(id, couple.id);
    const data = await parseJson(request, memorySchema);
    const { safeUser } = await import("@/lib/safe-data");
    const memory = await prisma.memory.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        happenedAt: new Date(data.happenedAt),
        tags: data.tags,
        coverImageUrl: data.coverImageUrl,
      },
      include: { createdBy: true },
    });
    return ok({ memory: { ...memory, createdBy: safeUser(memory.createdBy) } });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { couple } = await requireAuth();
    const { id } = await params;
    await ensureMemory(id, couple.id);
    await prisma.memory.delete({ where: { id } });
    return ok({ success: true });
  } catch (err) {
    return jsonError(err);
  }
}
