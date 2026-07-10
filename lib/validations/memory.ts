import { z } from "zod";

export const memorySchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc.").max(80),
  description: z.string().max(1000).default(""),
  happenedAt: z.string().min(1),
  tags: z.array(z.string().max(30)).max(8).default([]),
  coverImageUrl: z.string().url().optional().nullable(),
  coverImagePathname: z.string().optional().nullable(),
});
