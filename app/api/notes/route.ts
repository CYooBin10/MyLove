import { prisma } from "@/lib/db";
import { jsonError, ok, parseJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/require-auth";
import { noteSchema } from "@/lib/validations/note";

export async function GET() {
  try {
    const { couple } = await requireAuth();
    const { safeUser } = await import("@/lib/safe-data");
    const notes = await prisma.loveNote.findMany({
      where: { coupleId: couple.id },
      include: { sender: true },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    });
    return ok({ notes: notes.map(n => ({ ...n, sender: safeUser(n.sender) })) });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(request: Request) {
  try {
    const { user, couple } = await requireAuth();
    const data = await parseJson(request, noteSchema);
    const { safeUser } = await import("@/lib/safe-data");
    const note = await prisma.loveNote.create({
      data: { coupleId: couple.id, senderId: user.id, body: data.body },
      include: { sender: true },
    });
    return ok({ note: { ...note, sender: safeUser(note.sender) } }, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}
