import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers/app-providers";
import type { SessionResponse } from "@/lib/types";
import "@/app/globals.css";

export const metadata = {
  title: "MyLove",
  description: "Private couples app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const initialSession: SessionResponse = { authenticated: false, needsSetup: true };

  return (
    <html lang="vi">
      <body className="md:py-8">
        <AppProviders initialSession={initialSession}>{children}</AppProviders>
      </body>
    </html>
  );
}
