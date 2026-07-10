import { z } from "zod";

export const galleryImageInputSchema = z.object({
  url: z.string().url(),
  pathname: z.string().min(1),
  caption: z.string().max(200).optional().nullable(),
  memoryId: z.string().optional().nullable(),
});

export const galleryImageSchema = galleryImageInputSchema;

export const galleryImagesSchema = z.object({
  images: z.array(galleryImageInputSchema).min(1).max(30),
});
