"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ToastItem = { id: number; message: string; tone?: "success" | "error" | "info" };
const ToastContext = createContext<{ push: (message: string, tone?: ToastItem["tone"]) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((message: string, tone: ToastItem["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 3200);
  }, []);
  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-4 z-[100] mx-auto flex w-full max-w-sm flex-col gap-2 px-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto rounded-2xl px-4 py-3 text-sm shadow-soft animate-fadeIn",
              item.tone === "error" && "bg-destructive text-destructive-foreground",
              item.tone === "success" && "bg-foreground text-background",
              item.tone === "info" && "bg-card text-card-foreground border"
            )}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used within ToastProvider");
  return value;
}
