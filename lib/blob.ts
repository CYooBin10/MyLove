import { del, put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { ApiError } from "@/lib/api";
import { MAX_UPLOAD_SIZE } from "@/lib/constants";

export async function uploadImage(file: File, folder: string) {
  if (!file.type.startsWith("image/")) {
    throw new ApiError("Chỉ hỗ trợ file ảnh.", 400);
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new ApiError("Ảnh quá lớn. Tối đa 8MB.", 400);
  }

  const ext = file.name.split(".").pop() || "jpg";
  const pathname = `${folder}/${randomUUID()}.${ext}`;
  const blob = await put(pathname, file, { access: "public" });
  return { url: blob.url, pathname: blob.pathname };
}

export async function deleteImage(pathname?: string | null) {
  if (!pathname) return;
  await del(pathname);
}
