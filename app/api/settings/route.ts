import { prisma } from "@/lib/db";
import { jsonError, ok, parseJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/require-auth";
import { settingsSchema } from "@/lib/validations/settings";

export async function GET() {
  try {
    const { couple } = await requireAuth();
    const settings = await prisma.settings.findUnique({
      where: { coupleId: couple.id },
    });
    return ok({ settings });
  } catch (err) {
    return jsonError(err);
  }
}

export async function PATCH(request: Request) {
  try {
    const { couple } = await requireAuth();
    const data = await parseJson(request, settingsSchema);
    const settings = await prisma.settings.upsert({
      where: { coupleId: couple.id },
      update: { theme: data.theme, appName: data.appName, pollingSeconds: data.pollingSeconds },
      create: { coupleId: couple.id, theme: data.theme, appName: data.appName, pollingSeconds: data.pollingSeconds },
    });
    return ok({ settings });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE() {
  try {
    const { couple } = await requireAuth();
    // Cascade delete couple will delete users, memories, gallery (need to delete blob too, or delete all blob folders separately)
    // To delete all gallery images from blob:
    const images = await prisma.galleryImage.findMany({ where: { coupleId: couple.id } });
    for (const img of images) {
      try {
        const { del } = await import("@vercel/blob");
        await del(img.pathname);
      } catch {}
    }

    await prisma.couple.delete({ where: { id: couple.id } });
    const { clearSessionCookie } = await import("@/lib/auth/session");
    await clearSessionCookie();

    return ok({ success: true });
  } catch (err) {
    return jsonError(err);
  }
}
