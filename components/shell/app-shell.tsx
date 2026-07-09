import type { ReactNode } from "react";
import { BottomNav } from "@/components/shell/bottom-nav";
import { TopAppBar } from "@/components/shell/top-app-bar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-background md:my-6 md:min-h-[calc(100dvh-3rem)] md:rounded-[36px] md:border md:border-border/70 md:shadow-soft md:overflow-hidden">
      <TopAppBar />
      {children}
      <BottomNav />
    </div>
  );
}
