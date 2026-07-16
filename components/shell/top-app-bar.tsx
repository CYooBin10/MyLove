"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellDot, Images, UserRound } from "lucide-react";
import { HEADER_TITLES } from "@/lib/constants";
import { Avatar } from "@/components/ui/avatar";
import { useSessionState } from "@/components/providers/app-providers";

export function TopAppBar() {
  const pathname = usePathname();
  const { session } = useSessionState();
  const title = HEADER_TITLES[pathname] || session.couple?.appName || "MyLove";
  const me = session.couple?.users.find((u) => u.id === session.user?.id) || session.user;

  return (
    <header className="safe-top sticky top-0 z-30 bg-background/70 px-4 pb-3 pt-3 backdrop-blur-xl">
      <div className="rounded-[28px] bg-white/55 px-4 py-3 shadow-[0_18px_50px_-36px_rgba(88,39,52,0.65)] backdrop-blur-md dark:bg-card/55">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-muted-foreground">MyLove private app</p>
            <h1 className="truncate text-lg font-black text-foreground">{title}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/gallery" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/75 text-foreground shadow-[0_12px_30px_-22px_rgba(88,39,52,0.55)] dark:bg-card/80">
              <Images className="h-5 w-5" />
            </Link>
            <Link href="/notes" className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/75 text-foreground shadow-[0_12px_30px_-22px_rgba(88,39,52,0.55)] dark:bg-card/80">
              <BellDot className="h-5 w-5" />
              {(session.unread?.notes || 0) > 0 ? <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-primary" /> : null}
            </Link>
            <Link href="/profile" className="flex items-center gap-2 rounded-full bg-white/75 px-2 py-1 shadow-[0_12px_30px_-22px_rgba(88,39,52,0.55)] dark:bg-card/80">
              {me ? <Avatar src={me.avatarUrl} name={me.name} size="sm" /> : <UserRound className="h-4 w-4" />}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
