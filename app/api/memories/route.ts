import { prisma } from "@/lib/db";
import { jsonError, ok, parseJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/require-auth";
import { memorySchema } from "@/lib/validations/memory";

export async function GET() {
  try {
    const { couple } = await requireAuth();
    const { safeUser } = await import("@/lib/safe-data");
    const memories = await prisma.memory.findMany({
      where: { coupleId: couple.id },
      include: { createdBy: true },
      orderBy: [{ happenedAt: "desc" }, { createdAt: "desc" }],
    });
    const safeMemories = memories.map(m => ({ ...m, createdBy: safeUser(m.createdBy) }));
    return ok({ memories: safeMemories });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(request: Request) {
  try {
    const { user, couple } = await requireAuth();
    const data = await parseJson(request, memorySchema);
    const { safeUser } = await import("@/lib/safe-data");
    const memory = await prisma.memory.create({
      data: {
        coupleId: couple.id,
        createdById: user.id,
        title: data.title,
        description: data.description,
        happenedAt: new Date(data.happenedAt),
        tags: data.tags,
        coverImageUrl: data.coverImageUrl,
      },
      include: { createdBy: true },
    });
    return ok({ memory: { ...memory, createdBy: safeUser(memory.createdBy) } }, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}
