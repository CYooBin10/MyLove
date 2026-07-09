import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = HTMLAttributes<HTMLSpanElement> & {
  variant?: "primary" | "secondary" | "outline";
  active?: boolean;
};

export function Chip({ className, variant = "secondary", active, children, ...props }: Props) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-full px-3 text-xs font-medium transition cursor-pointer select-none border border-transparent",
        variant === "primary" && "bg-primary text-primary-foreground",
        variant === "secondary" && "bg-muted text-muted-foreground",
        variant === "outline" && "border-border text-muted-foreground",
        active && "bg-primary text-primary-foreground border-transparent",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
