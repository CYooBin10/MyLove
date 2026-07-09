"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { SHELL_POLL_SECONDS } from "@/lib/constants";
import type { SessionResponse } from "@/lib/types";
import { apiFetch } from "@/lib/client-api";
import { ToastProvider } from "@/components/ui/toast";

type SessionContextValue = {
  session: SessionResponse;
  refreshSession: () => Promise<void>;
  theme: string;
  setTheme: (value: string) => void;
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

export function AppProviders({ initialSession, children }: { initialSession: SessionResponse; children: ReactNode }) {
  const [session, setSession] = useState(initialSession);
  const [theme, setThemeState] = useState(initialSession.couple?.settings?.theme || "system");
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

  useEffect(() => {
    const stored = window.localStorage.getItem("mylove-theme");
    const initial = stored || theme;
    applyTheme(initial);
    if (stored && stored !== theme) setThemeState(stored);
  }, [theme]);

  useEffect(() => {
    refreshSession();
    timer.current = window.setInterval(refreshSession, SHELL_POLL_SECONDS * 1000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [refreshSession]);

  const value = useMemo(() => ({ session, refreshSession, theme, setTheme }), [session, refreshSession, theme, setTheme]);

  return (
    <ToastProvider>
      <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
    </ToastProvider>
  );
}

export function useSessionState() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSessionState must be used within AppProviders");
  return value;
}
