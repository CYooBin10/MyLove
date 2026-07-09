import { prisma } from "@/lib/db";
import { parseJson, ok, jsonError } from "@/lib/api";
import { setupSchema } from "@/lib/validations/auth";
import { hashPassword } from "@/lib/auth/password";

export async function POST(request: Request) {
  try {
    const coupleCount = await prisma.couple.count();
    if (coupleCount > 0) {
      return Response.json({ error: "Hệ thống đã được thiết lập." }, { status: 400 });
    }

    const data = await parseJson(request, setupSchema);
    const codeHash = await hashPassword(data.coupleCode);
    const p1Hash = await hashPassword(data.user1Password);
    const p2Hash = await hashPassword(data.user2Password);

    const couple = await prisma.couple.create({
      data: {
        displayName: data.coupleName,
        codeHash,
        startDate: new Date(data.startDate),
        appName: data.appName,
        users: {
          createMany: {
            data: [
              { slot: 1, name: data.user1Name, passwordHash: p1Hash },
              { slot: 2, name: data.user2Name, passwordHash: p2Hash },
            ],
          },
        },
        settings: {
          create: {
            appName: data.appName,
          },
        },
      },
      include: {
        users: true,
      },
    });

    return ok({ success: true, coupleId: couple.id });
  } catch (err) {
    return jsonError(err);
  }
}
