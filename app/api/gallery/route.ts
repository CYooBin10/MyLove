import { prisma } from "@/lib/db";
import { jsonError, ok, parseJson, ApiError } from "@/lib/api";
import { requireAuth } from "@/lib/auth/require-auth";
import { galleryImageSchema, galleryImagesSchema } from "@/lib/validations/gallery";

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
    const body = await request.clone().json();
    const { safeUser } = await import("@/lib/safe-data");

    // Check if it is batch or single image
    if (body && Array.isArray(body.images)) {
      const data = await parseJson(request, galleryImagesSchema);

      // Verify all memoryIds belong to the couple
      const memoryIds = data.images.map(img => img.memoryId).filter((id): id is string => !!id);
      if (memoryIds.length > 0) {
        const validCount = await prisma.memory.count({
          where: { id: { in: memoryIds }, coupleId: couple.id },
        });
        const uniqueMemoryIds = new Set(memoryIds);
        if (validCount !== uniqueMemoryIds.size) {
          throw new ApiError("Một số kỷ niệm được tham chiếu không thuộc cặp đôi của bạn.", 403);
        }
      }

      // Create all images in a transaction
      const images = await prisma.$transaction(
        data.images.map((img) =>
          prisma.galleryImage.create({
            data: {
              coupleId: couple.id,
              uploadedById: user.id,
              url: img.url,
              pathname: img.pathname,
              caption: img.caption,
              memoryId: img.memoryId || null,
            },
            include: { uploadedBy: true },
          })
        )
      );

      return ok({ images: images.map(i => ({ ...i, uploadedBy: safeUser(i.uploadedBy) })) }, { status: 201 });
    } else {
      // Single image fallback
      const data = await parseJson(request, galleryImageSchema);
      if (data.memoryId) {
        const mem = await prisma.memory.findFirst({ where: { id: data.memoryId, coupleId: couple.id } });
        if (!mem) throw new ApiError("Kỷ niệm được tham chiếu không thuộc cặp đôi của bạn.", 403);
      }

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
    }
  } catch (err) {
    return jsonError(err);
  }
}
