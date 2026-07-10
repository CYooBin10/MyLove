import type { NotificationOpenedPayload } from "@/lib/mobile/bridge-contract";

export function resolveNotificationRoute(payload: NotificationOpenedPayload) {
  if (payload.route?.startsWith("/")) return payload.route;

  if (payload.url && typeof window !== "undefined") {
    try {
      const url = new URL(payload.url, window.location.origin);
      if (url.origin === window.location.origin) return `${url.pathname}${url.search}${url.hash}`;
    } catch {}
  }

  switch (payload.event) {
    case "note.created":
    case "message.created":
      return "/notes";
    case "ting-ting.created":
      return "/ting-ting";
    case "memory.created":
      return payload.entityId ? `/memories/${payload.entityId}` : "/memories";
    case "gallery.created":
      return "/gallery";
    case "special-day.created":
    case "reminder.created":
      return "/calendar";
    default:
      return "/home";
  }
}
