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
    <ScreenContainer className="relative space-y-4 overflow-x-clip pb-36">
      <div className="pointer-events-none absolute -left-20 top-2 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-56 h-60 w-60 rounded-full bg-amber-200/30 blur-3xl dark:bg-secondary/10" />

      <div className="relative z-10 space-y-4">
        <div className="px-1 pt-1">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 text-[11px] font-semibold text-primary shadow-[0_10px_30px_-24px_rgba(232,93,117,0.8)] backdrop-blur-md dark:bg-card/60">
            <Heart className="h-3.5 w-3.5 fill-current" />
            Chỉ riêng hai đứa
          </div>
          <h2 className="text-2xl font-black tracking-tight text-foreground/95">{greeting}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Một góc nhỏ để nhớ, thương và gửi nhau mấy điều ngọt xíu.</p>
        </div>

        <Card className="relative overflow-visible rounded-[36px] border-0 bg-gradient-to-br from-primary/20 via-card to-amber-100/70 p-0 text-center shadow-[0_28px_90px_-46px_rgba(232,93,117,0.9)] dark:to-secondary/10">
          <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
            <div className="absolute -left-12 -top-16 h-44 w-44 rounded-full bg-white/60 blur-3xl dark:bg-white/5" />
            <div className="absolute left-1/2 top-8 h-40 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-[55px]" />
            <div className="absolute -right-12 bottom-0 h-44 w-44 rounded-full bg-amber-200/50 blur-3xl dark:bg-secondary/10" />
          </div>

          <div className="relative z-10 px-5 pb-5 pt-6">
            <AnimatedCoupleAvatars users={users} triggerKey={comboKey} />

            <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 text-xs font-bold text-primary shadow-[0_12px_34px_-28px_rgba(232,93,117,0.9)] backdrop-blur-md dark:bg-card/65">
              <Sparkles className="h-3.5 w-3.5 fill-current" />
              Nhật ký yêu thương
            </div>

            <div className="relative my-1 flex justify-center">
              <button
                type="button"
                onClick={triggerTapCombo}
                className="group relative inline-flex min-h-[96px] min-w-[168px] items-center justify-center rounded-full bg-white/70 px-9 py-2 shadow-[inset_0_2px_10px_rgba(255,255,255,0.65),0_18px_45px_-28px_rgba(232,93,117,0.95)] backdrop-blur-md transition-all duration-300 active:scale-[0.96] dark:bg-card/70"
                aria-label="Tạo hiệu ứng"
              >
                <span className="font-serif text-[72px] font-extrabold leading-none tracking-tight text-primary drop-shadow-sm select-none tabular-nums">
                  {stats.totalDays}
                </span>
              </button>
              <FloatingParticles ref={particlesRef} />
            </div>

            <p className="mt-2 text-sm font-bold text-foreground/85">ngày tụi mình ở bên nhau</p>
            <p className="mt-1 text-xs text-muted-foreground/85">Từ {formatDate(couple?.startDate)} đến hôm nay vẫn thương.</p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-[22px] bg-white/55 px-2 py-3 shadow-[0_12px_32px_-28px_rgba(232,93,117,0.9)] backdrop-blur-md dark:bg-card/55">
                <p className="text-2xl font-black text-primary/90 tracking-tight">{stats.years}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">năm</p>
              </div>
              <div className="rounded-[22px] bg-white/55 px-2 py-3 shadow-[0_12px_32px_-28px_rgba(232,93,117,0.9)] backdrop-blur-md dark:bg-card/55">
                <p className="text-2xl font-black text-primary/90 tracking-tight">{stats.months}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">tháng</p>
              </div>
              <div className="rounded-[22px] bg-white/55 px-2 py-3 shadow-[0_12px_32px_-28px_rgba(232,93,117,0.9)] backdrop-blur-md dark:bg-card/55">
                <p className="text-2xl font-black text-primary/90 tracking-tight">{stats.days}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">ngày</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden rounded-[32px] border-0 bg-gradient-to-br from-rose-100/70 via-card to-amber-50/90 p-5 shadow-[0_22px_70px_-48px_rgba(232,93,117,0.85)] dark:from-primary/15 dark:to-secondary/10">
          <div className="absolute -right-4 -bottom-4 text-primary/10">
            <Quote className="h-28 w-28 fill-current rotate-180" />
          </div>
          <div className="relative z-10 mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/65 px-3 py-1 text-xs font-bold text-primary shadow-[0_10px_26px_-22px_rgba(232,93,117,0.8)] backdrop-blur-md dark:bg-card/60">
            <Sparkles className="h-3.5 w-3.5 fill-current" />
            Lời nhắn hôm nay
          </div>
          <p className="relative z-10 pl-1 font-serif text-lg italic leading-relaxed text-foreground/90">
            “{getDailyQuote(QUOTES)}”
          </p>
        </Card>

        <div className="space-y-3">
          <div className="px-1">
            <p className="text-sm font-black text-foreground/90">Làm gì đó cho người yêu nè</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Nhanh, nhẹ, không giống mấy cái nút web nữa.</p>
          </div>

          <Link href="/notes" className="group flex min-h-16 items-center gap-3 rounded-[28px] bg-gradient-to-r from-card via-rose-50/80 to-primary/10 p-4 shadow-[0_20px_60px_-46px_rgba(88,39,52,0.55)] transition-all active:scale-[0.98] dark:via-card dark:to-primary/15">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-primary text-primary-foreground shadow-[0_14px_34px_-22px_rgba(232,93,117,0.9)] transition-transform duration-300 group-active:scale-95">
              <Send className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-foreground/95">Gửi một note</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Viết vài dòng làm người kia cười.</p>
            </div>
          </Link>

          <Link href="/ting-ting" className="group flex min-h-16 items-center gap-3 rounded-[28px] bg-gradient-to-r from-card via-amber-50/80 to-accent/30 p-4 shadow-[0_20px_60px_-46px_rgba(88,39,52,0.55)] transition-all active:scale-[0.98] dark:via-card dark:to-accent/10">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-accent text-accent-foreground shadow-[0_14px_34px_-22px_rgba(251,146,60,0.75)] transition-transform duration-300 group-active:scale-95">
              <BellRing className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-foreground/95">Bấm ting ting</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Gọi nhẹ một cái để được nhớ tới.</p>
            </div>
          </Link>

          <Link href="/gallery" className="group flex min-h-16 items-center gap-3 rounded-[28px] bg-gradient-to-r from-card via-pink-50/80 to-secondary/10 p-4 shadow-[0_20px_60px_-46px_rgba(88,39,52,0.55)] transition-all active:scale-[0.98] dark:via-card dark:to-secondary/15">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-secondary text-secondary-foreground shadow-[0_14px_34px_-22px_rgba(124,58,237,0.7)] transition-transform duration-300 group-active:scale-95">
              <ImagePlus className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-foreground/95">Thêm ảnh kỷ niệm</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Cất một khoảnh khắc vào album chung.</p>
            </div>
          </Link>
        </div>
      </div>
    </ScreenContainer>
  );
}
