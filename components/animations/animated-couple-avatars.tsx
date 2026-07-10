"use client";

import React, { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import type { SafeUser } from "@/lib/safe-data";

type Props = {
  users: SafeUser[];
  triggerKey?: number;
};

export function AnimatedCoupleAvatars({ users, triggerKey = 0 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Parallax pointer target values (-1 to 1)
  const pointerTarget = useRef({ x: 0, y: 0 });
  const pointerCurrent = useRef({ x: 0, y: 0 });

  // Cuddle tap effect timing
  const cuddleUntil = useRef(0);
  const [pulse, setPulse] = useState(false);

  // Physics positions for RAF loop (Avatar 0, Avatar 1)
  const [poses, setPoses] = useState([
    { x: 0, y: 0, scale: 1, rotate: 0 },
    { x: 0, y: 0, scale: 1, rotate: 0 },
  ]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // External trigger (combines with day counter tap)
  const prevTriggerKey = useRef(triggerKey);
  useEffect(() => {
    if (triggerKey > prevTriggerKey.current) {
      prevTriggerKey.current = triggerKey;
      triggerCuddle();
    }
  }, [triggerKey]);

  const triggerCuddle = () => {
    if (reducedMotion) return;
    cuddleUntil.current = Date.now() + 500;
    setPulse(true);
    setTimeout(() => setPulse(false), 500);
  };

  useEffect(() => {
    if (reducedMotion) return;

    let rafId: number;

    const tick = () => {
      const now = Date.now();
      const t = now / 1000;
      const isCuddling = now < cuddleUntil.current;

      // Smooth interpolation for pointer parallax (smaller dampening factor = smoother slide)
      pointerCurrent.current.x += (pointerTarget.current.x - pointerCurrent.current.x) * 0.08;
      pointerCurrent.current.y += (pointerTarget.current.y - pointerCurrent.current.y) * 0.08;

      const nextPoses = [0, 1].map((i) => {
        const side = i === 0 ? -1 : 1; // Left is -1, Right is 1

        // 1. Idle float (slow wave offset for a living feel)
        const floatY = Math.sin(t * 1.8 + i * 1.8) * 4;
        const floatX = Math.cos(t * 1.2 + i * 1.5) * 2;

        // 2. Parallax drift (X shifts inward/outward, Y shifts based on pointer)
        const parallaxX = pointerCurrent.current.x * side * -6;
        const parallaxY = pointerCurrent.current.y * 5;

        // 3. Cuddle shift: INWARD (Left avatar moves Right (x increases), Right avatar moves Left (x decreases))
        // So cuddleX should move opposite to side: left (side -1) gets +14px, right (side 1) gets -14px
        const cuddleX = isCuddling ? side * -14 : 0;
        const cuddleY = isCuddling ? 4 : 0;
        const cuddleScale = isCuddling ? 0.12 : 0;

        // 4. Subtle breathing scale
        const breathingScale = Math.sin(t * 2.2 + i * Math.PI) * 0.012;

        // Computed positions
        const x = floatX + parallaxX + cuddleX;
        const y = floatY + parallaxY + cuddleY;
        const scale = 1 + breathingScale + cuddleScale;

        // Rotate: Left (side -1) tilts clockwise/right (e.g. +6deg), Right (side 1) tilts counter-clockwise/left (e.g. -6deg)
        // This tilts them inward towards each other during cuddle/pulse
        const baseRotate = side * 2; // subtle default tilt apart
        const cuddleRotate = isCuddling ? side * -10 : 0; // tilt towards each other
        const rotate = baseRotate + pointerCurrent.current.x * side * -3 + cuddleRotate;

        return { x, y, scale, rotate };
      });

      setPoses(nextPoses);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [reducedMotion]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0 to 1
    const py = (e.clientY - rect.top) / rect.height; // 0 to 1
    pointerTarget.current.x = (px - 0.5) * 2; // -1 to 1
    pointerTarget.current.y = (py - 0.5) * 2; // -1 to 1
  };

  const handlePointerLeave = () => {
    pointerTarget.current.x = 0;
    pointerTarget.current.y = 0;
  };

  const visibleUsers = users.slice(0, 2);

  if (visibleUsers.length === 0) return null;

  // Static fallback if reduced motion
  if (reducedMotion) {
    return (
      <div className="mb-4 flex justify-center -space-x-4 select-none">
        {visibleUsers.map((user) => (
          <Avatar key={user.id} src={user.avatarUrl} name={user.name} size="xl" className="ring-4 ring-card" />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={triggerCuddle}
      className="mb-4 flex h-32 items-center justify-center relative touch-none cursor-pointer select-none overflow-visible"
    >
      {/* Dynamic heart halo backdrop during combo/cuddle */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500 scale-75 opacity-0 ${
          pulse ? "scale-110 opacity-30" : ""
        }`}
      >
        <div className="h-28 w-28 rounded-full bg-primary/20 blur-xl" />
      </div>

      {visibleUsers.map((user, i) => {
        const pose = poses[i] || { x: 0, y: 0, scale: 1, rotate: 0 };
        const isLeft = i === 0;

        return (
          <div
            key={user.id}
            className="absolute transition-shadow duration-300"
            style={{
              // Centers around middle. h-24 is 96px. Gap between centers is 76px.
              // Left center = 50% - 38px - 48px offset = 50% - 86px.
              // Right center = 50% + 38px - 48px offset = 50% - 10px.
              left: isLeft ? "calc(50% - 94px)" : "calc(50% - 2px)",
              zIndex: isLeft ? 10 : 20,
              transform: `translate3d(${pose.x}px, ${pose.y}px, 0) scale(${pose.scale}) rotate(${pose.rotate}deg)`,
              willChange: "transform",
            }}
          >
            {/* Custom sizing override inside Container for large w-24 h-24 avatars */}
            <div className="relative rounded-full">
              <Avatar
                src={user.avatarUrl}
                name={user.name}
                size="xl"
                className={`ring-4 ring-card transition-all duration-300 w-24 h-24 border-border/60 ${
                  pulse
                    ? "ring-primary/20 shadow-[0_0_24px_rgba(232,93,117,0.5)] border-primary/40 scale-105"
                    : "shadow-soft"
                }`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
