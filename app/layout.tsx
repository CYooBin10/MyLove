import type { ReactNode } from "react";
import { headers } from "next/headers";
import { apiFetch } from "@/lib/client-api";
import { AppProviders } from "@/components/providers/app-providers";
import type { SessionResponse } from "@/lib/types";
import "@/app/globals.css";

export const metadata = {
  title: "MyLove",
  description: "Private couples app",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  let initialSession: SessionResponse = { authenticated: false, needsSetup: true };

  try {
    const h = await headers();
    const host = h.get("host") || "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const cookie = h.get("cookie") || "";
    initialSession = await apiFetch<SessionResponse>(`${protocol}://${host}/api/auth/session`, {
      headers: { cookie },
      cache: "no-store",
    });
  } catch (e) {
    console.error("Failed to load initial session:", e);
  }

  return (
    <html lang="vi">
      <body className="bg-[#121212]/5 dark:bg-[#121212] md:py-8">
        <AppProviders initialSession={initialSession}>{children}</AppProviders>
      </body>
    </html>
  );
}
