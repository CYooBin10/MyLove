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
    <nav className="safe-bottom fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 px-3 pb-3 pt-2">
      <div className="grid min-w-0 grid-cols-5 gap-1 rounded-[30px] bg-white/75 p-1.5 shadow-[0_-18px_55px_-36px_rgba(88,39,52,0.7)] backdrop-blur-xl dark:bg-card/80">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const badge = item.href === "/ting-ting" ? session.unread?.tingTing || session.unread?.notes || 0 : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-h-14 min-w-0 flex-col items-center justify-center rounded-[24px] px-1 text-[11px] font-medium transition active:scale-[0.98]",
                active ? "bg-primary/14 text-primary shadow-[0_12px_30px_-22px_rgba(232,93,117,0.8)]" : "text-muted-foreground"
              )}
            >
              <Icon className="mb-1 h-5 w-5" />
              <span className="max-w-full truncate whitespace-nowrap">{item.label}</span>
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
