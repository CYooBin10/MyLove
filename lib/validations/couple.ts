import { z } from "zod";

export const coupleUpdateSchema = z.object({
  displayName: z.string().min(1).max(60).optional(),
  startDate: z.string().min(1).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  appName: z.string().min(1).max(40).optional(),
  theme: z.enum(["light", "dark", "system", "rose"]).optional(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(40).optional(),
  nickname: z.string().max(40).optional().nullable(),
  birthday: z.string().optional().nullable(),
  favoriteColor: z.string().max(40).optional().nullable(),
  noteAbout: z.string().max(500).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
});
