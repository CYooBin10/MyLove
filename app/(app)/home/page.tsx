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
      <div className="pointer-events-none absolute -right-24 top-56 h-60 w-60 rounded-full bg-accent/20 blur-3xl dark:bg-secondary/10" />

      <div className="relative z-10 space-y-4">
        <div className="px-1 pt-1">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-card/70 px-3 py-1 text-[11px] font-semibold text-primary shadow-soft backdrop-blur-md">
            <Heart className="h-3.5 w-3.5 fill-current" />
            Chỉ riêng hai đứa
          </div>
          <h2 className="text-2xl font-black tracking-tight text-foreground/95">{greeting}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Một góc nhỏ để nhớ, thương và gửi nhau mấy điều ngọt xíu.</p>
        </div>

        <Card className="relative overflow-visible rounded-[36px] border-0 bg-gradient-to-br from-primary/20 via-card to-accent/25 p-0 text-center shadow-soft">
          <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
            <div className="absolute -left-12 -top-16 h-44 w-44 rounded-full bg-card/60 blur-3xl dark:bg-card/20" />
            <div className="absolute left-1/2 top-8 h-40 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-[55px]" />
            <div className="absolute -right-12 bottom-0 h-44 w-44 rounded-full bg-accent/30 blur-3xl" />
          </div>

          <div className="relative z-10 px-5 pb-5 pt-6">
            <AnimatedCoupleAvatars users={users} triggerKey={comboKey} />

            <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full bg-card/70 px-3 py-1 text-xs font-bold text-primary shadow-soft backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 fill-current" />
              Nhật ký yêu thương
            </div>

            <div className="relative my-1 flex justify-center">
              <button
                type="button"
                onClick={triggerTapCombo}
                className="group relative inline-flex min-h-[96px] min-w-[168px] items-center justify-center rounded-full bg-card/75 px-9 py-2 shadow-soft backdrop-blur-md transition-all duration-300 active:scale-[0.96]"
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
              <div className="rounded-[22px] bg-card/65 px-2 py-3 shadow-soft backdrop-blur-md">
                <p className="text-2xl font-black text-primary/90 tracking-tight">{stats.years}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">năm</p>
              </div>
              <div className="rounded-[22px] bg-card/65 px-2 py-3 shadow-soft backdrop-blur-md">
                <p className="text-2xl font-black text-primary/90 tracking-tight">{stats.months}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">tháng</p>
              </div>
              <div className="rounded-[22px] bg-card/65 px-2 py-3 shadow-soft backdrop-blur-md">
                <p className="text-2xl font-black text-primary/90 tracking-tight">{stats.days}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">ngày</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden rounded-[32px] border-0 bg-gradient-to-br from-primary/15 via-card to-accent/20 p-5 shadow-soft">
          <div className="absolute -right-4 -bottom-4 text-primary/10">
            <Quote className="h-28 w-28 fill-current rotate-180" />
          </div>
          <div className="relative z-10 mb-3 inline-flex items-center gap-1.5 rounded-full bg-card/70 px-3 py-1 text-xs font-bold text-primary shadow-soft backdrop-blur-md">
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

          <Link href="/notes" className="group flex min-h-16 items-center gap-3 rounded-[28px] bg-gradient-to-r from-card via-primary/5 to-primary/10 p-4 shadow-soft transition-all active:scale-[0.98] dark:via-card dark:to-primary/15">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-primary text-primary-foreground shadow-soft transition-transform duration-300 group-active:scale-95">
              <Send className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-foreground/95">Gửi một note</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Viết vài dòng làm người kia cười.</p>
            </div>
          </Link>

          <Link href="/ting-ting" className="group flex min-h-16 items-center gap-3 rounded-[28px] bg-gradient-to-r from-card via-accent/10 to-accent/20 p-4 shadow-soft transition-all active:scale-[0.98] dark:via-card dark:to-accent/10">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-accent text-accent-foreground shadow-soft transition-transform duration-300 group-active:scale-95">
              <BellRing className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-foreground/95">Bấm ting ting</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Gọi nhẹ một cái để được nhớ tới.</p>
            </div>
          </Link>

          <Link href="/gallery" className="group flex min-h-16 items-center gap-3 rounded-[28px] bg-gradient-to-r from-card via-secondary/5 to-secondary/10 p-4 shadow-soft transition-all active:scale-[0.98] dark:via-card dark:to-secondary/15">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-secondary text-secondary-foreground shadow-soft transition-transform duration-300 group-active:scale-95">
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
