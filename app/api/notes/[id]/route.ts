import { prisma } from "@/lib/db";
import { ApiError, jsonError, ok, parseJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/require-auth";
import { noteUpdateSchema } from "@/lib/validations/note";

async function ensureNote(id: string, coupleId: string) {
  const note = await prisma.loveNote.findUnique({ where: { id }, include: { sender: true } });
  if (!note || note.coupleId !== coupleId) throw new ApiError("Không tìm thấy note.", 404);
  return note;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { couple } = await requireAuth();
    const { id } = await params;
    await ensureNote(id, couple.id);
    const data = await parseJson(request, noteUpdateSchema);
    const { safeUser } = await import("@/lib/safe-data");
    const note = await prisma.loveNote.update({
      where: { id },
      data: {
        body: data.body,
        pinned: data.pinned,
        readAt: data.read === true ? new Date() : data.read === false ? null : undefined,
      },
      include: { sender: true },
    });
    return ok({ note: { ...note, sender: safeUser(note.sender) } });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { couple } = await requireAuth();
    const { id } = await params;
    await ensureNote(id, couple.id);
    await prisma.loveNote.delete({ where: { id } });
    return ok({ success: true });
  } catch (err) {
    return jsonError(err);
  }
}
