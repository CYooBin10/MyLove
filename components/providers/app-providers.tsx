"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { SHELL_POLL_SECONDS } from "@/lib/constants";
import type { SessionResponse } from "@/lib/types";
import { apiFetch } from "@/lib/client-api";
import { ToastProvider } from "@/components/ui/toast";
import { MobileBridgeBootstrap } from "@/components/providers/mobile-bridge-bootstrap";

type SessionContextValue = {
  session: SessionResponse;
  refreshSession: () => Promise<void>;
  theme: string;
  setTheme: (value: string) => void;
  colorTheme: "pink" | "aqua" | "red";
  setColorTheme: (value: "pink" | "aqua" | "red") => void;
  animationPack: string;
  setAnimationPack: (value: string) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function applyTheme(value: string) {
  const root = document.documentElement;
  const resolved = value === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
    : value;
  root.classList.toggle("dark", resolved === "dark");
}

function applyColorTheme(value: "pink" | "aqua" | "red") {
  document.documentElement.dataset.colorTheme = value;
}

export function AppProviders({ initialSession, children }: { initialSession: SessionResponse; children: ReactNode }) {
  const [session, setSession] = useState(initialSession);
  const [theme, setThemeState] = useState(initialSession.couple?.settings?.theme || "system");
  const [colorTheme, setColorThemeState] = useState<"pink" | "aqua" | "red">("pink");
  const [animationPack, setAnimationPackState] = useState<string>("hearts");
  const timer = useRef<number | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const data = await apiFetch<SessionResponse>("/api/auth/session", { cache: "no-store" });
      setSession(data);
      if (data.couple?.settings?.theme) {
        setThemeState(data.couple.settings.theme);
      }
    } catch {}
  }, []);

  const setTheme = useCallback((value: string) => {
    setThemeState(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("mylove-theme", value);
      applyTheme(value);
    }
  }, []);

  const setColorTheme = useCallback((value: "pink" | "aqua" | "red") => {
    setColorThemeState(value);
    window.localStorage.setItem("mylove-color-theme", value);
    applyColorTheme(value);
  }, []);

  const setAnimationPack = useCallback((value: string) => {
    setAnimationPackState(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("mylove-animation-pack", value);
    }
  }, []);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("mylove-theme");
    const initialTheme = storedTheme || theme;
    applyTheme(initialTheme);
    if (storedTheme && storedTheme !== theme) setThemeState(storedTheme);

    const storedColorTheme = window.localStorage.getItem("mylove-color-theme");
    const initialColorTheme = storedColorTheme === "pink" || storedColorTheme === "aqua" || storedColorTheme === "red" ? storedColorTheme : "pink";
    applyColorTheme(initialColorTheme);
    if (initialColorTheme !== colorTheme) setColorThemeState(initialColorTheme);

    const storedAnim = window.localStorage.getItem("mylove-animation-pack");
    if (storedAnim) setAnimationPackState(storedAnim);
  }, [colorTheme, theme]);

  useEffect(() => {
    refreshSession();
    timer.current = window.setInterval(refreshSession, SHELL_POLL_SECONDS * 1000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [refreshSession]);

  const value = useMemo(() => ({
    session,
    refreshSession,
    theme,
    setTheme,
    colorTheme,
    setColorTheme,
    animationPack,
    setAnimationPack
  }), [session, refreshSession, theme, setTheme, colorTheme, setColorTheme, animationPack, setAnimationPack]);

  return (
    <ToastProvider>
      <SessionContext.Provider value={value}>
        <MobileBridgeBootstrap session={session} />
        {children}
      </SessionContext.Provider>
    </ToastProvider>
  );
}

export function useSessionState() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSessionState must be used within AppProviders");
  return value;
}
