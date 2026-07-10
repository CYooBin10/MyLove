"use client";

import { useRef } from "react";
import { Heart, Sparkles } from "lucide-react";
import { FloatingParticles, type FloatingParticlesRef } from "@/components/animations/floating-particles";
import { ScreenContainer } from "@/components/shell/screen-container";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useSessionState } from "@/components/providers/app-providers";
import { QUOTES } from "@/lib/constants";
import { formatDate, getDailyQuote, getRelationshipStats } from "@/lib/dates";

export default function HomePage() {
  const { session } = useSessionState();
  const couple = session.couple;
  const users = couple?.users || [];
  const stats = couple ? getRelationshipStats(couple.startDate) : { totalDays: 0, years: 0, months: 0, days: 0 };
  const particlesRef = useRef<FloatingParticlesRef>(null);

  function popHeart() {
    particlesRef.current?.trigger();
  }

  return (
    <ScreenContainer className="space-y-4">
      <Card className="relative overflow-hidden p-6 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.16),transparent_55%)]" />
        <div className="relative z-10">
          <div className="mb-4 flex justify-center -space-x-3">
            {users.map((user) => (
              <Avatar key={user.id} src={user.avatarUrl} name={user.name} size="lg" className="ring-4 ring-card" />
            ))}
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Đã bên nhau</p>
          <button
            type="button"
            onClick={popHeart}
            className="relative mt-2 inline-flex items-center justify-center rounded-[32px] px-6 py-2 active:scale-[0.98] transition"
            aria-label="Tạo hiệu ứng"
          >
            <span className="font-serif text-[76px] font-bold leading-none text-primary tabular-nums">{stats.totalDays}</span>
            <FloatingParticles ref={particlesRef} />
          </button>
          <p className="text-base font-semibold">ngày yêu nhau</p>
          <p className="mt-2 text-sm text-muted-foreground">Từ {formatDate(couple?.startDate)}</p>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.years}</p>
          <p className="text-xs text-muted-foreground">năm</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.months}</p>
          <p className="text-xs text-muted-foreground">tháng</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.days}</p>
          <p className="text-xs text-muted-foreground">ngày</p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <h3 className="font-bold">Quote hôm nay</h3>
        </div>
        <p className="text-base leading-relaxed text-foreground">“{getDailyQuote(QUOTES)}”</p>
      </Card>

      <Card className="bg-primary/8 border-primary/10 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <div>
            <h3 className="font-bold">Hôm nay là ngày thứ {stats.totalDays}</h3>
            <p className="mt-1 text-sm text-muted-foreground">Một ngày nhỏ trong câu chuyện dài của hai người.</p>
          </div>
        </div>
      </Card>
    </ScreenContainer>
  );
}
