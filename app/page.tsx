"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionState } from "@/components/providers/app-providers";
import { SplashScreen } from "@/components/shell/splash-screen";
import { DatabaseErrorState } from "@/components/ui/database-error-state";

export default function RootPage() {
  const { session } = useSessionState();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (session.dbError) {
      return;
    } else if (session.needsSetup) {
      router.replace("/setup");
    } else if (session.authenticated) {
      router.replace("/home");
    } else {
      router.replace("/login");
    }
  }, [session, router]);

  if (!mounted) return null;
  if (session.dbError) return <DatabaseErrorState message={session.dbErrorMessage} />;

  return <SplashScreen />;
}
