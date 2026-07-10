"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { mobileBridge, onNotificationOpened } from "@/lib/mobile/webview-bridge";
import { resolveNotificationRoute } from "@/lib/mobile/notification-routing";
import { apiFetch } from "@/lib/client-api";
import type { NotificationOpenedPayload } from "@/lib/mobile/bridge-contract";
import type { SessionResponse } from "@/lib/types";

function getCachedPermission(deviceId: string) {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(`native-permission:${deviceId}:notification`) || "null") as {
      status?: string;
      updatedAt?: number;
    } | null;
  } catch {
    return null;
  }
}

function setCachedPermission(deviceId: string, status: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    `native-permission:${deviceId}:notification`,
    JSON.stringify({ status, updatedAt: Date.now() })
  );
}

export function MobileBridgeBootstrap({ session }: { session: SessionResponse }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const bridge = mobileBridge;
    if (!bridge || !bridge.isNativeApp() || !session.authenticated || !session.user) return;
    const activeBridge = bridge;

    let disposed = false;

    async function bootstrap() {
      try {
        const app = await activeBridge.handshake(session.user?.id);
        if (!app || disposed) return;

        const cached = getCachedPermission(app.deviceId);
        const currentStatus = cached?.status || app.permissions.notification || "unknown";

        if (currentStatus === "unknown") {
          const result = await activeBridge.requestPermission("notification");
          if (disposed) return;
          setCachedPermission(app.deviceId, result.status);
          if (result.status === "blocked" || result.status === "denied") return;
        }

        const effective = getCachedPermission(app.deviceId)?.status || app.permissions.notification;
        if (effective === "granted") {
          const token = await activeBridge.getPushToken();
          if (disposed || !token?.token) return;
          await apiFetch("/api/mobile/push-tokens", {
            method: "POST",
            body: JSON.stringify(token),
          });
        }
      } catch (error) {
        console.warn("[bridge] bootstrap failed", error);
      }
    }

    bootstrap();
    return () => {
      disposed = true;
    };
  }, [session.authenticated, session.user?.id]);

  useEffect(() => {
    if (!mobileBridge?.isNativeApp()) return undefined;

    return onNotificationOpened((payload: NotificationOpenedPayload) => {
      const route = resolveNotificationRoute(payload);
      if (route && route !== pathname) router.push(route);
    });
  }, [pathname, router]);

  return null;
}
