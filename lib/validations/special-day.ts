import { z } from "zod";

export const specialDaySchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc.").max(60),
  date: z.string().min(1),
  type: z.enum(["ANNIVERSARY", "BIRTHDAY", "DATE", "TRIP", "CUSTOM"]),
  note: z.string().max(500).optional().nullable(),
  repeatsYearly: z.boolean().default(true),
});
