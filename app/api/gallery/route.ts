import { prisma } from "@/lib/db";
import { jsonError, ok, parseJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/require-auth";
import { galleryImageSchema } from "@/lib/validations/gallery";

export async function GET() {
  try {
    const { couple } = await requireAuth();
    const { safeUser } = await import("@/lib/safe-data");
    const images = await prisma.galleryImage.findMany({
      where: { coupleId: couple.id },
      include: { uploadedBy: true, memory: true },
      orderBy: { createdAt: "desc" },
    });
    return ok({ images: images.map(i => ({ ...i, uploadedBy: safeUser(i.uploadedBy) })) });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(request: Request) {
  try {
    const { user, couple } = await requireAuth();
    const data = await parseJson(request, galleryImageSchema);
    const { safeUser } = await import("@/lib/safe-data");
    const image = await prisma.galleryImage.create({
      data: {
        coupleId: couple.id,
        uploadedById: user.id,
        url: data.url,
        pathname: data.pathname,
        caption: data.caption,
        memoryId: data.memoryId || null,
      },
      include: { uploadedBy: true },
    });
    return ok({ image: { ...image, uploadedBy: safeUser(image.uploadedBy) } }, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}
