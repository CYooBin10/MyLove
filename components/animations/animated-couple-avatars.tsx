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
    cuddleUntil.current = Date.now() + 450;
    setPulse(true);
    setTimeout(() => setPulse(false), 450);
  };

  useEffect(() => {
    if (reducedMotion) return;

    let rafId: number;

    const tick = () => {
      const now = Date.now();
      const t = now / 1000;
      const isCuddling = now < cuddleUntil.current;

      // Smooth interpolation for pointer parallax
      pointerCurrent.current.x += (pointerTarget.current.x - pointerCurrent.current.x) * 0.12;
      pointerCurrent.current.y += (pointerTarget.current.y - pointerCurrent.current.y) * 0.12;

      const nextPoses = [0, 1].map((i) => {
        const side = i === 0 ? -1 : 1;

        // 1. Idle float (slow wave)
        const floatY = Math.sin(t * 1.5 + i * 1.7) * 3;

        // 2. Parallax drift (X shifts inward/outward, Y shifts based on pointer)
        const parallaxX = pointerCurrent.current.x * side * -4;
        const parallaxY = pointerCurrent.current.y * 3;

        // 3. Cuddle shift (inward scale pulse)
        const cuddleX = isCuddling ? side * 8 : 0;
        const cuddleY = isCuddling ? -2 : 0;
        const cuddleScale = isCuddling ? 0.08 : 0;

        // 4. Subtle breathing scale
        const breathingScale = Math.sin(t * 2 + i) * 0.015;

        // Computed values
        const x = parallaxX + cuddleX;
        const y = floatY + parallaxY + cuddleY;
        const scale = 1 + breathingScale + cuddleScale;
        const rotate = side * 1.5 + pointerCurrent.current.x * side * -2 + (isCuddling ? side * -4 : 0);

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

  // Return static overlap if reduced motion or zero users
  if (visibleUsers.length === 0) return null;
  if (reducedMotion) {
    return (
      <div className="mb-4 flex justify-center -space-x-3 select-none">
        {visibleUsers.map((user) => (
          <Avatar key={user.id} src={user.avatarUrl} name={user.name} size="lg" className="ring-4 ring-card" />
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
      className="mb-4 flex h-20 items-center justify-center relative touch-none cursor-pointer select-none"
    >
      {visibleUsers.map((user, i) => {
        const pose = poses[i] || { x: 0, y: 0, scale: 1, rotate: 0 };
        const isLeft = i === 0;

        return (
          <div
            key={user.id}
            className="absolute transition-shadow duration-300"
            style={{
              left: isLeft ? "calc(50% - 62px)" : "calc(50% - 2px)",
              zIndex: isLeft ? 10 : 20,
              transform: `translate3d(${pose.x}px, ${pose.y}px, 0) scale(${pose.scale}) rotate(${pose.rotate}deg)`,
            }}
          >
            <Avatar
              src={user.avatarUrl}
              name={user.name}
              size="lg"
              className={`ring-4 ring-card transition-shadow ${
                pulse
                  ? "shadow-[0_0_20px_rgba(232,93,117,0.4)] border-primary/20"
                  : ""
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}
