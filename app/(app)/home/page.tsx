"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { Heart, Sparkles, Send, BellRing, ImagePlus, Quote } from "lucide-react";
import { FloatingParticles, type FloatingParticlesRef } from "@/components/animations/floating-particles";
import { AnimatedCoupleAvatars } from "@/components/animations/animated-couple-avatars";
import { ScreenContainer } from "@/components/shell/screen-container";
import { Card } from "@/components/ui/card";
import { useSessionState } from "@/components/providers/app-providers";
import { QUOTES } from "@/lib/constants";
import { formatDate, getDailyQuote, getRelationshipStats } from "@/lib/dates";

function getGreetingMessage(name?: string | null) {
  const hr = new Date().getHours();
  const suffix = name ? `, ${name}` : "";
  if (hr >= 5 && hr < 12) return `Chào buổi sáng${suffix} ☀️`;
  if (hr >= 12 && hr < 18) return `Buổi chiều ngọt ngào${suffix} ☕`;
  return `Buổi tối ấm áp${suffix} 🌙`;
}

export default function HomePage() {
  const { session } = useSessionState();
  const couple = session.couple;
  const users = couple?.users || [];
  const me = users.find((u) => u.id === session.user?.id) || session.user;
  const stats = couple ? getRelationshipStats(couple.startDate) : { totalDays: 0, years: 0, months: 0, days: 0 };

  const particlesRef = useRef<FloatingParticlesRef>(null);
  const [comboKey, setComboKey] = useState(0);
  const [greeting, setGreeting] = useState("Nhà của tụi mình ♥");

  useEffect(() => {
    if (me?.name) {
      setGreeting(getGreetingMessage(me.nickname || me.name));
    }
  }, [me]);

  function triggerTapCombo() {
    setComboKey((k) => k + 1);
    particlesRef.current?.trigger();
  }

  return (
    <ScreenContainer className="space-y-4 pb-32">
      {/* 1. Dynamic Greeting Header */}
      <div className="px-1 py-1">
        <h2 className="text-xl font-extrabold tracking-tight text-foreground/90">{greeting}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Chào mừng về không gian riêng của hai đứa</p>
      </div>

      {/* 2. Premium Glow Hero Card */}
      <Card className="relative overflow-hidden p-6 text-center border-primary/10 shadow-soft bg-gradient-to-b from-card to-background/50">
        {/* Glow Effects */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-[50px] dark:bg-primary/5" />
        <div className="pointer-events-none absolute right-4 top-4 h-12 w-12 rounded-full bg-amber-400/5 blur-xl" />

        <div className="relative z-10">
          {/* Avatar Interaction duo */}
          <AnimatedCoupleAvatars users={users} triggerKey={comboKey} />

          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/80 mt-2">Chúng ta đã thương nhau</p>

          <div className="my-2 flex justify-center">
            <button
              type="button"
              onClick={triggerTapCombo}
              className="group relative inline-flex items-center justify-center rounded-[32px] bg-primary/6 px-8 py-2 border border-primary/10 active:scale-[0.97] transition-all duration-300 shadow-[inset_0_2px_8px_rgba(232,93,117,0.06)] hover:bg-primary/10"
              aria-label="Tạo hiệu ứng"
            >
              <span className="font-serif text-[72px] font-extrabold leading-none text-primary tracking-tight select-none tabular-nums drop-shadow-sm">
                {stats.totalDays}
              </span>
              <FloatingParticles ref={particlesRef} />
            </button>
          </div>

          <p className="text-sm font-bold text-foreground/80">ngày yêu thương</p>
          <p className="mt-1 text-xs text-muted-foreground/80">Cột mốc hạnh phúc từ {formatDate(couple?.startDate)}</p>
        </div>
      </Card>

      {/* 3. Unified Widget Stats Panel */}
      <Card className="p-0 overflow-hidden divide-x divide-border/60 flex border-border/60 shadow-soft bg-card/70 backdrop-blur-md">
        <div className="flex-1 py-4 text-center">
          <p className="text-2xl font-black text-primary/90 tracking-tight">{stats.years}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">năm</p>
        </div>
        <div className="flex-1 py-4 text-center">
          <p className="text-2xl font-black text-primary/90 tracking-tight">{stats.months}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">tháng</p>
        </div>
        <div className="flex-1 py-4 text-center">
          <p className="text-2xl font-black text-primary/90 tracking-tight">{stats.days}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">ngày</p>
        </div>
      </Card>

      {/* 4. Refined Elegant Quote Card */}
      <Card className="relative p-5 border-primary/5 bg-primary/5 dark:bg-primary/5/10 overflow-hidden">
        <div className="absolute -right-2 -bottom-2 opacity-5 text-primary">
          <Quote className="h-24 w-24 fill-current rotate-180" />
        </div>
        <div className="mb-2 flex items-center gap-1.5 text-primary/95 font-semibold text-xs uppercase tracking-wider">
          <Sparkles className="h-4 w-4 fill-current" />
          <span>Quote hôm nay</span>
        </div>
        <p className="text-base font-serif italic leading-relaxed text-foreground/90 pl-1">
          “{getDailyQuote(QUOTES)}”
        </p>
      </Card>

      {/* 5. Quick Actions Grid (Intimate Actions Shortcuts) */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 pl-1">Thao tác nhanh cùng người yêu</p>
        <div className="grid grid-cols-3 gap-3">
          <Link href="/notes" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border/80 shadow-soft active:scale-[0.97] transition-all group hover:border-primary/20">
            <div className="h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center text-primary group-hover:scale-105 transition duration-300">
              <Send className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-foreground/90 mt-2">Gửi Note</span>
          </Link>
          <Link href="/ting-ting" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border/80 shadow-soft active:scale-[0.97] transition-all group hover:border-primary/20">
            <div className="h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center text-primary group-hover:scale-105 transition duration-300">
              <BellRing className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-foreground/90 mt-2">Bấm Ting</span>
          </Link>
          <Link href="/gallery" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border/80 shadow-soft active:scale-[0.97] transition-all group hover:border-primary/20">
            <div className="h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center text-primary group-hover:scale-105 transition duration-300">
              <ImagePlus className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-foreground/90 mt-2">Đăng ảnh</span>
          </Link>
        </div>
      </div>
    </ScreenContainer>
  );
}
