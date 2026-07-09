import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type SheetProps = HTMLAttributes<HTMLDivElement> & {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export function BottomSheet({ isOpen, onClose, title, children, className, ...props }: SheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 animate-fadeIn" onClick={onClose}>
      <div
        className={cn(
          "w-full max-w-[480px] rounded-t-[28px] border-t border-border/85 bg-card p-6 shadow-sheet animate-sheetUp safe-bottom max-h-[85vh] overflow-y-auto",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted-foreground/30" />
        {title ? <h3 className="mb-4 text-lg font-bold text-foreground">{title}</h3> : null}
        {children}
      </div>
    </div>
  );
}
