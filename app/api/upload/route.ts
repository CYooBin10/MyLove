import { requireAuth } from "@/lib/auth/require-auth";
import { uploadImage } from "@/lib/blob";
import { jsonError, ok } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const { couple } = await requireAuth();
    const data = await request.formData();
    const file = data.get("file") as File | null;
    if (!file) return Response.json({ error: "Thiếu file tải lên." }, { status: 400 });

    const result = await uploadImage(file, `couples/${couple.id}`);
    return ok(result);
  } catch (err) {
    return jsonError(err);
  }
}
