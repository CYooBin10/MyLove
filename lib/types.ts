import type { SafeUser, SafeCouple } from "./safe-data";
import type { Prisma } from "@prisma/client";

export type CoupleBundle = SafeCouple;
export type SafeUserType = SafeUser;

export type MemoryWithUser = Prisma.MemoryGetPayload<{
  include: { createdBy: true };
}>;

export type NoteWithSender = Prisma.LoveNoteGetPayload<{
  include: { sender: true };
}>;

export type TingWithSender = Prisma.TingTingGetPayload<{
  include: { sender: true };
}>;

export type GalleryWithRelations = Prisma.GalleryImageGetPayload<{
  include: { uploadedBy: true; memory: true };
}>;

export type SessionResponse = {
  authenticated: boolean;
  needsSetup: boolean;
  dbError?: boolean;
  dbErrorMessage?: string;
  user?: SafeUser;
  couple?: CoupleBundle;
  unread?: { tingTing: number; notes: number };
};
