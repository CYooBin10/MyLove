import { z } from "zod";

export const tingTingSchema = z.object({
  type: z.string().min(1).max(40),
  message: z.string().max(160).optional().nullable(),
});

export const tingTingMarkSchema = z.object({
  ids: z.array(z.string()).optional(),
});
