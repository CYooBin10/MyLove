import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "default" | "sm" | "icon";
  loading?: boolean;
};

export function Button({ className, variant = "primary", size = "default", loading, children, disabled, ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-medium transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-primary text-primary-foreground shadow-soft",
        variant === "secondary" && "bg-card text-foreground border",
        variant === "ghost" && "bg-transparent text-foreground",
        variant === "danger" && "bg-destructive text-destructive-foreground",
        size === "sm" && "min-h-10 rounded-xl px-3 text-xs",
        size === "icon" && "h-12 w-12 px-0",
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      {children}
    </button>
  );
}
