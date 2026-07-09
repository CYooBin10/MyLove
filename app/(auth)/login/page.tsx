"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { DatabaseErrorState } from "@/components/ui/database-error-state";
import { useSessionState } from "@/components/providers/app-providers";
import { apiFetch } from "@/lib/client-api";

export default function LoginPage() {
  const { refreshSession, session } = useSessionState();
  const router = useRouter();
  const toast = useToast();

  const [slot, setSlot] = useState<1 | 2>(1);
  const [password, setPassword] = useState("");
  const [useCoupleCode, setUseCoupleCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (session.dbError) return <DatabaseErrorState message={session.dbErrorMessage} />;

  if (session.authenticated) {
    router.replace("/home");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.push("Vui lòng nhập mật khẩu/mã cặp đôi.", "error");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ slot, password, useCoupleCode }),
      });
      toast.push("Đăng nhập thành công!");
      await refreshSession();
      router.replace("/home");
    } catch (err: any) {
      toast.push(err.message || "Đăng nhập thất bại.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-sm p-6 border-border/80">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary/12 text-2xl text-primary">♥</div>
          <h2 className="text-xl font-bold">Đăng nhập MyLove</h2>
          <p className="mt-1 text-xs text-muted-foreground">K không gian riêng của hai người</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bạn là ai?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSlot(1)}
                className={`h-11 rounded-2xl border px-4 text-sm font-medium transition active:scale-[0.98] ${
                  slot === 1
                    ? "border-primary bg-primary/8 text-primary font-bold"
                    : "border-border text-muted-foreground"
                }`}
              >
                Người thứ 1 (Slot 1)
              </button>
              <button
                type="button"
                onClick={() => setSlot(2)}
                className={`h-11 rounded-2xl border px-4 text-sm font-medium transition active:scale-[0.98] ${
                  slot === 2
                    ? "border-primary bg-primary/8 text-primary font-bold"
                    : "border-border text-muted-foreground"
                }`}
              >
                Người thứ 2 (Slot 2)
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {useCoupleCode ? "Mã cặp đôi (Couple Code)" : "Mật khẩu của bạn"}
              </label>
              <button
                type="button"
                onClick={() => setUseCoupleCode(!useCoupleCode)}
                className="text-xs text-primary font-semibold hover:underline"
              >
                {useCoupleCode ? "Dùng mật khẩu riêng" : "Dùng mã cặp đôi"}
              </button>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={useCoupleCode ? "Nhập mã cặp đôi chung..." : "Nhập mật khẩu của bạn..."}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2">
            Đăng nhập
          </Button>
        </form>
      </Card>
    </div>
  );
}
