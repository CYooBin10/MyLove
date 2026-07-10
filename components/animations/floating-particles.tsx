"use client";

import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import { Heart, Sparkles, Flower } from "lucide-react";
import { useSessionState } from "@/components/providers/app-providers";

export type Particle = {
  id: number;
  x: number; // Spawn horizontal offset (%)
  scale: number;
  tx: number; // Target X translate (px)
  ty: number; // Target Y translate (px)
  rot: number; // Rotation degree
  sway: number; // Sway amplitude
};

export type FloatingParticlesRef = {
  trigger: () => void;
};

export const FloatingParticles = forwardRef<FloatingParticlesRef, {}>((_, ref) => {
  const { animationPack } = useSessionState();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const trigger = useCallback(() => {
    if (animationPack === "none" || reducedMotion) return;

    const count = animationPack === "sparkles" ? 10 : 6;
    const newParticles: Particle[] = Array.from({ length: count }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const distance = 40 + Math.random() * 50;

      return {
        id: Date.now() + i + Math.random(),
        x: 40 + Math.random() * 20, // Centered spawn (40% - 60%)
        scale: 0.7 + Math.random() * 0.5,
        tx: Math.cos(angle) * distance,
        ty: -60 - Math.random() * 80,
        rot: (Math.random() - 0.5) * 90,
        sway: (Math.random() - 0.5) * 40,
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);
  }, [animationPack, reducedMotion]);

  useImperativeHandle(ref, () => ({ trigger }));

  useEffect(() => {
    if (particles.length === 0) return;
    const timer = setTimeout(() => {
      const now = Date.now();
      setParticles((prev) => prev.filter((p) => now - p.id < 1200));
    }, 1200);
    return () => clearTimeout(timer);
  }, [particles]);

  if (animationPack === "none" || reducedMotion || particles.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {particles.map((p) => {
        let IconComponent: any = Heart;
        let colorClass = "text-primary fill-primary";
        let animationClass = "animate-floatHeart";

        if (animationPack === "sparkles") {
          IconComponent = Sparkles;
          colorClass = "text-amber-400 fill-amber-300";
          animationClass = "animate-burstSparkle";
        } else if (animationPack === "blossom") {
          IconComponent = Flower;
          colorClass = "text-pink-300 fill-pink-200 dark:text-pink-400 dark:fill-pink-300";
          animationClass = "animate-driftBlossom";
        }

        return (
          <span
            key={p.id}
            className={`absolute ${colorClass} ${animationClass}`}
            style={{
              left: `${p.x}%`,
              bottom: "40px",
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              "--rot": `${p.rot}deg`,
              "--sway": `${p.sway}px`,
              transform: `scale(${p.scale})`,
            } as React.CSSProperties}
          >
            <IconComponent className="h-6 w-6" />
          </span>
        );
      })}
    </div>
  );
});

FloatingParticles.displayName = "FloatingParticles";
