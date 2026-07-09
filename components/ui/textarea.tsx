import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
};

export function Textarea({ className, error, ...props }: Props) {
  return (
    <div className="w-full">
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-2xl border border-input bg-muted/20 px-4 py-3 text-sm transition-all focus:bg-card placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          error && "border-destructive focus:ring-destructive",
          className
        )}
        {...props}
      />
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
