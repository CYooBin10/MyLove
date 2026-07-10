import { requireAuth } from "@/lib/auth/require-auth";
import { uploadImage } from "@/lib/blob";
import { jsonError, ok } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const { couple } = await requireAuth();
    const data = await request.formData();
    const files = data.getAll("files").filter((file): file is File => file instanceof File);
    const singleFile = data.get("file");

    if (singleFile instanceof File && files.length === 0) {
      const result = await uploadImage(singleFile, `couples/${couple.id}`);
      return ok({ ...result, uploads: [result] });
    }

    if (files.length === 0) {
      return Response.json({ error: "Thiếu file tải lên." }, { status: 400 });
    }

    const uploads = await Promise.all(files.map((file) => uploadImage(file, `couples/${couple.id}`)));
    return ok({ uploads });
  } catch (err) {
    return jsonError(err);
  }
}
