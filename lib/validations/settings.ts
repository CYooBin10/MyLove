import { z } from "zod";

export const settingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  appName: z.string().min(1).max(40),
  pollingSeconds: z.coerce.number().int().min(5).max(300),
});
