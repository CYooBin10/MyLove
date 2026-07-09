"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { DatabaseErrorState } from "@/components/ui/database-error-state";
import { useSessionState } from "@/components/providers/app-providers";
import { apiFetch } from "@/lib/client-api";

export default function SetupPage() {
  const { refreshSession, session } = useSessionState();
  const router = useRouter();
  const toast = useToast();

  const [coupleName, setCoupleName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [coupleCode, setCoupleCode] = useState("");
  const [user1Name, setUser1Name] = useState("");
  const [user1Password, setUser1Password] = useState("");
  const [user2Name, setUser2Name] = useState("");
  const [user2Password, setUser2Password] = useState("");
  const [appName, setAppName] = useState("MyLove");
  const [loading, setLoading] = useState(false);

  if (session.dbError) return <DatabaseErrorState message={session.dbErrorMessage} />;

  if (!session.needsSetup) {
    router.replace("/login");
    return null;
  }

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupleName || !startDate || !coupleCode || !user1Name || !user1Password || !user2Name || !user2Password) {
      toast.push("Vui lòng điền đầy đủ tất cả thông tin.", "error");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/api/setup", {
        method: "POST",
        body: JSON.stringify({
          appName,
          coupleName,
          startDate,
          coupleCode,
          user1Name,
          user1Password,
          user2Name,
          user2Password,
        }),
      });
      toast.push("Thiết lập thành công! Hãy đăng nhập.");
      await refreshSession();
      router.replace("/login");
    } catch (err: any) {
      toast.push(err.message || "Thiết lập thất bại.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md p-6 border-border/80 my-8">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary/12 text-2xl text-primary">♥</div>
          <h2 className="text-xl font-bold">Khởi tạo không gian MyLove</h2>
          <p className="mt-1 text-xs text-muted-foreground">Thiết lập mật khẩu & thông tin cặp đôi</p>
        </div>

        <form onSubmit={handleSetup} className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-bold border-b pb-1 text-primary">1. Thông tin cặp đôi</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Tên cặp đôi</label>
                <Input placeholder="Ví dụ: Bảo & Hân" value={coupleName} onChange={(e) => setCoupleName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Ngày bắt đầu yêu</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Mã cặp đôi (Sử dụng chung)</label>
              <Input placeholder="Mã bảo mật chung..." value={coupleCode} onChange={(e) => setCoupleCode(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Tên ứng dụng hiển thị (Tùy chọn)</label>
              <Input value={appName} onChange={(e) => setAppName(e.target.value)} />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold border-b pb-1 text-primary">2. Người thứ nhất (Slot 1)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Tên hiển thị</label>
                <Input placeholder="Ví dụ: Anh" value={user1Name} onChange={(e) => setUser1Name(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Mật khẩu riêng</label>
                <Input type="password" placeholder="Tối thiểu 4 ký tự..." value={user1Password} onChange={(e) => setUser1Password(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold border-b pb-1 text-primary">3. Người thứ hai (Slot 2)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Tên hiển thị</label>
                <Input placeholder="Ví dụ: Em" value={user2Name} onChange={(e) => setUser2Name(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Mật khẩu riêng</label>
                <Input type="password" placeholder="Tối thiểu 4 ký tự..." value={user2Password} onChange={(e) => setUser2Password(e.target.value)} />
              </div>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-4">
            Khởi tạo & Hoàn tất
          </Button>
        </form>
      </Card>
    </div>
  );
}
