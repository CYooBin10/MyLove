import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ScreenContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cn("min-w-0 flex-1 px-4 pb-28 pt-4", className)}>{children}</main>;
}
