"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useSessionState } from "@/components/providers/app-providers";

export function BottomNav() {
  const pathname = usePathname();
  const { session } = useSessionState();

  return (
    <nav className="safe-bottom fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-border/70 bg-card/96 px-2 pb-2 pt-2 backdrop-blur">
      <div className="grid grid-cols-5 gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const badge = item.href === "/ting-ting" ? session.unread?.tingTing || session.unread?.notes || 0 : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-h-14 flex-col items-center justify-center rounded-2xl px-2 text-[11px] font-medium transition active:scale-[0.98]",
                active ? "bg-primary/12 text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="mb-1 h-5 w-5" />
              <span>{item.label}</span>
              {badge > 0 ? (
                <span className="absolute right-3 top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                  {badge > 9 ? "9+" : badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
