import { z } from "zod";

export const galleryImageSchema = z.object({
  url: z.string().url(),
  pathname: z.string().min(1),
  caption: z.string().max(200).optional().nullable(),
  memoryId: z.string().optional().nullable(),
});
