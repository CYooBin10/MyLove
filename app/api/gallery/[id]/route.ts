import { prisma } from "@/lib/db";
import { ApiError, jsonError, ok, parseJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/require-auth";
import { deleteImage } from "@/lib/blob";
import { galleryImageSchema } from "@/lib/validations/gallery";

async function ensureImage(id: string, coupleId: string) {
  const image = await prisma.galleryImage.findUnique({ where: { id } });
  if (!image || image.coupleId !== coupleId) throw new ApiError("Không tìm thấy ảnh.", 404);
  return image;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { couple } = await requireAuth();
    const { id } = await params;
    await ensureImage(id, couple.id);
    const data = await parseJson(request, galleryImageSchema.partial());
    const { safeUser } = await import("@/lib/safe-data");
    const image = await prisma.galleryImage.update({
      where: { id },
      data: { caption: data.caption, memoryId: data.memoryId || null },
      include: { uploadedBy: true },
    });
    return ok({ image: { ...image, uploadedBy: safeUser(image.uploadedBy) } });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { couple } = await requireAuth();
    const { id } = await params;
    const image = await ensureImage(id, couple.id);

    // Delete from vercel blob
    await deleteImage(image.pathname);
    // Delete from DB
    await prisma.galleryImage.delete({ where: { id } });

    return ok({ success: true });
  } catch (err) {
    return jsonError(err);
  }
}
