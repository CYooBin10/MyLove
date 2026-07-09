import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type DialogProps = HTMLAttributes<HTMLDivElement> & {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
};

export function Dialog({ isOpen, onClose, title, description, children, className, ...props }: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 animate-fadeIn" onClick={onClose}>
      <div
        className={cn(
          "w-full max-w-sm rounded-[28px] border border-border/80 bg-card p-6 shadow-soft",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
