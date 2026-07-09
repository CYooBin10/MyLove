import { z } from "zod";

const password = z.string().min(4, "Mật khẩu tối thiểu 4 ký tự.").max(100);

export const setupSchema = z.object({
  appName: z.string().min(1).max(40).default("MyLove"),
  coupleName: z.string().min(1, "Tên couple là bắt buộc.").max(60),
  startDate: z.string().min(1, "Ngày bắt đầu là bắt buộc."),
  coupleCode: password,
  user1Name: z.string().min(1, "Tên người thứ nhất là bắt buộc.").max(40),
  user1Password: password,
  user2Name: z.string().min(1, "Tên người thứ hai là bắt buộc.").max(40),
  user2Password: password,
});

export const loginSchema = z.object({
  slot: z.coerce.number().int().min(1).max(2),
  password: password,
  useCoupleCode: z.boolean().default(false),
});

export const passwordChangeSchema = z.object({
  currentPassword: password,
  newPassword: password,
});
