import { jsonError, ok, parseJson, ApiError } from "@/lib/api";
import { internalPushSendSchema } from "@/lib/validations/mobile";
import { sendPushNotification } from "@/lib/push/send-fcm";

function verifyInternalToken(request: Request) {
  const expected = process.env.INTERNAL_PUSH_SECRET;
  if (!expected) throw new ApiError("Thiếu INTERNAL_PUSH_SECRET.", 500);

  const auth = request.headers.get("authorization") || "";
  if (auth !== `Bearer ${expected}`) {
    throw new ApiError("Không có quyền gọi endpoint này.", 401);
  }
}

export async function POST(request: Request) {
  try {
    verifyInternalToken(request);
    const data = await parseJson(request, internalPushSendSchema);
    const result = await sendPushNotification(data);
    return ok({ success: true, data: result });
  } catch (err) {
    return jsonError(err);
  }
}
