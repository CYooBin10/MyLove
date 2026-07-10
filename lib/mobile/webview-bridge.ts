"use client";

import type {
  AppReadyPayload,
  BridgeMessage,
  BridgeMessageType,
  NotificationOpenedPayload,
  PermissionName,
  PermissionResultPayload,
  PushTokenPayload,
} from "@/lib/mobile/bridge-contract";

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    __APP_BRIDGE_RECEIVE__?: (raw: string) => void;
  }
}

const BRIDGE_VERSION = 1;

function makeRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function browserFallbackPermission(permission: PermissionName): PermissionResultPayload {
  return { permission, status: "unavailable" };
}

class WebViewBridge {
  private ready = false;
  private pending = new Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (reason?: unknown) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  private listeners = new Map<BridgeMessageType, Set<(payload: any) => void>>();

  constructor() {
    if (typeof window !== "undefined") {
      window.__APP_BRIDGE_RECEIVE__ = (raw: string) => this.receive(raw);
    }
  }

  isNativeApp() {
    return typeof window !== "undefined" && typeof window.ReactNativeWebView?.postMessage === "function";
  }

  isReady() {
    return this.ready;
  }

  on<T = unknown>(type: BridgeMessageType, handler: (payload: T) => void) {
    const handlers = this.listeners.get(type) ?? new Set();
    const wrapped = handler as (payload: any) => void;
    handlers.add(wrapped);
    this.listeners.set(type, handlers);
    return () => {
      handlers.delete(wrapped);
    };
  }

  async handshake(userId?: string | null) {
    if (!this.isNativeApp()) return null;
    const payload = await this.request<AppReadyPayload>(
      "WEB_READY",
      {
        userId: userId ?? null,
        pathname: `${window.location.pathname}${window.location.search}`,
      },
      3000
    );
    this.ready = true;
    return payload;
  }

  async requestPermission(permission: PermissionName) {
    if (!this.isNativeApp()) return browserFallbackPermission(permission);
    return this.request<PermissionResultPayload>("REQUEST_PERMISSION", { permission }, 15000);
  }

  async getPushToken() {
    if (!this.isNativeApp()) return null;
    return this.request<PushTokenPayload>("GET_PUSH_TOKEN", { provider: "fcm" }, 15000);
  }

  async openSystemSettings(section: "notifications" | "application") {
    if (!this.isNativeApp()) return null;
    return this.request("OPEN_SYSTEM_SETTINGS", { section }, 5000);
  }

  private post<T>(type: BridgeMessageType, payload?: T, requestId?: string) {
    if (!this.isNativeApp()) return;

    const message: BridgeMessage<T> = {
      version: BRIDGE_VERSION,
      source: "web",
      type,
      requestId,
      ts: Date.now(),
      payload,
    };

    window.ReactNativeWebView?.postMessage(JSON.stringify(message));
  }

  private request<T>(type: BridgeMessageType, payload?: unknown, timeoutMs = 10000): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = makeRequestId();
      const timer = setTimeout(() => {
        this.pending.delete(requestId);
        reject(new Error(`Bridge timeout: ${type}`));
      }, timeoutMs);

      this.pending.set(requestId, { resolve, reject, timer });
      this.post(type, payload, requestId);
    });
  }

  private receive(raw: string) {
    let message: BridgeMessage;

    try {
      message = JSON.parse(raw) as BridgeMessage;
    } catch {
      console.warn("[bridge] invalid JSON", raw);
      return;
    }

    if (!message || message.version !== BRIDGE_VERSION || !message.type) {
      console.warn("[bridge] invalid envelope", message);
      return;
    }

    if (message.type === "APP_READY") {
      this.ready = true;
    }

    if (message.requestId && this.pending.has(message.requestId)) {
      const pending = this.pending.get(message.requestId)!;
      clearTimeout(pending.timer);
      this.pending.delete(message.requestId);

      if (message.type === "ERROR") {
        pending.reject(new Error(message.error?.message || "Bridge error"));
        return;
      }

      pending.resolve(message.payload);
      return;
    }

    const handlers = this.listeners.get(message.type);
    if (!handlers) return;
    handlers.forEach((handler) => handler(message.payload));
  }
}

export const mobileBridge = typeof window !== "undefined" ? new WebViewBridge() : null;

export function isNativeApp() {
  return !!mobileBridge?.isNativeApp();
}

export function onNotificationOpened(handler: (payload: NotificationOpenedPayload) => void) {
  return mobileBridge?.on<NotificationOpenedPayload>("NOTIFICATION_OPENED", handler) ?? (() => undefined);
}
