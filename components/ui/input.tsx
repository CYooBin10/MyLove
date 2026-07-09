import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export function Input({ className, error, ...props }: Props) {
  return (
    <div className="w-full">
      <input
        className={cn(
          "flex h-12 w-full rounded-2xl border border-input bg-muted/20 px-4 py-2 text-sm transition-all focus:bg-card placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus:ring-destructive",
          className
        )}
        {...props}
      />
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
