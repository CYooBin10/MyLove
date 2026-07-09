import { z, type ZodTypeAny } from "zod";
import { NextResponse } from "next/server";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function getDatabaseErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const lower = message.toLowerCase();

  if (
    lower.includes("can't reach database server") ||
    lower.includes("database_url") ||
    lower.includes("error validating datasource") ||
    lower.includes("authentication failed against database server") ||
    lower.includes("the provided database string is invalid")
  ) {
    return "Không thể kết nối database. Hãy cập nhật DATABASE_URL trong file .env bằng chuỗi PostgreSQL thật rồi chạy `npx prisma migrate dev --name init`.";
  }

  return null;
}

export function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  const dbMessage = getDatabaseErrorMessage(error);
  if (dbMessage) {
    return NextResponse.json({ error: dbMessage, dbError: true }, { status: 503 });
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ error: "Có lỗi xảy ra." }, { status: 500 });
}

export async function parseJson<T extends ZodTypeAny>(request: Request, schema: T): Promise<z.infer<T>> {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ.", 400);
  }
  return parsed.data;
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}
