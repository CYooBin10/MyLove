import { z } from "zod";

export const noteSchema = z.object({
  body: z.string().min(1, "Note không được trống.").max(500),
});

export const noteUpdateSchema = z.object({
  body: z.string().min(1).max(500).optional(),
  pinned: z.boolean().optional(),
  read: z.boolean().optional(),
});
