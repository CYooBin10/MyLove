"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Sparkles, Moon, Sun, Download, Trash2, LogOut, Info, Heart } from "lucide-react";
import { ScreenContainer } from "@/components/shell/screen-container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useSessionState } from "@/components/providers/app-providers";
import { apiFetch } from "@/lib/client-api";
import { mobileBridge } from "@/lib/mobile/webview-bridge";

const ANIMATION_PACKS = [
  { id: "hearts", label: "Thả tim" },
  { id: "sparkles", label: "Lấp lánh" },
  { id: "blossom", label: "Hoa đào" },
  { id: "none", label: "Tắt" },
] as const;

export default function SettingsPage() {
  const { session, refreshSession, theme, setTheme, colorTheme, setColorTheme, animationPack, setAnimationPack } = useSessionState();
  const router = useRouter();
  const toast = useToast();

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [pwdTarget, setPwdTarget] = useState<"user" | "couple">("user");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.push("Vui lòng nhập đầy đủ mật khẩu.", "error");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/api/auth/password", {
        method: "PATCH",
        body: JSON.stringify({ target: pwdTarget, currentPassword, newPassword }),
      });
      toast.push("Đã đổi mật khẩu thành công!");
      setPasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      await refreshSession();
    } catch (err: any) {
      toast.push(err.message || "Lỗi đổi mật khẩu.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await apiFetch<any>("/api/export");
      const blob = new Blob([JSON.stringify(res, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mylove-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.push("Đã xuất sao lưu dữ liệu.");
    } catch {
      toast.push("Không thể xuất dữ liệu sao lưu.", "error");
    }
  };

  const handleDeleteAll = async () => {
    setLoading(true);
    try {
      await apiFetch("/api/settings", { method: "DELETE" });
      toast.push("Đã xóa vĩnh viễn toàn bộ dữ liệu ứng dụng.");
      await refreshSession();
      router.replace("/");
    } catch {
      toast.push("Không thể xóa dữ liệu.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = mobileBridge?.isNativeApp() ? await mobileBridge.getPushToken() : null;
      if (token?.deviceId) {
        await apiFetch("/api/mobile/push-tokens/deactivate", {
          method: "POST",
          body: JSON.stringify({ deviceId: token.deviceId, token: token.token, reason: "logout" }),
        });
      }
      await apiFetch("/api/auth/logout", {
        method: "POST",
        headers: token?.deviceId ? { "x-device-id": token.deviceId } : undefined,
      });
      toast.push("Đã đăng xuất.");
      await refreshSession();
      router.replace("/");
    } catch {
      toast.push("Không thể đăng xuất.", "error");
    }
  };

  return (
    <ScreenContainer className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Cài đặt</h2>
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4" /> Giao diện & Theme
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <Button variant={theme === "light" ? "primary" : "secondary"} size="sm" onClick={() => setTheme("light")} className="flex items-center gap-1">
            <Sun className="h-4 w-4" /> Sáng
          </Button>
          <Button variant={theme === "dark" ? "primary" : "secondary"} size="sm" onClick={() => setTheme("dark")} className="flex items-center gap-1">
            <Moon className="h-4 w-4" /> Tối
          </Button>
          <Button variant={theme === "system" ? "primary" : "secondary"} size="sm" onClick={() => setTheme("system")}>Hệ thống</Button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Button variant={colorTheme === "pink" ? "primary" : "secondary"} size="sm" onClick={() => setColorTheme("pink")}>Hồng</Button>
          <Button variant={colorTheme === "aqua" ? "primary" : "secondary"} size="sm" onClick={() => setColorTheme("aqua")}>Aqua</Button>
          <Button variant={colorTheme === "red" ? "primary" : "secondary"} size="sm" onClick={() => setColorTheme("red")}>Đỏ</Button>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Heart className="h-4 w-4" /> Hiệu ứng Home
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {ANIMATION_PACKS.map((pack) => (
            <Button key={pack.id} variant={animationPack === pack.id ? "primary" : "secondary"} size="sm" onClick={() => setAnimationPack(pack.id)}>
              {pack.label}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Shield className="h-4 w-4" /> Bảo mật & Tài khoản
        </h3>
        <div className="flex flex-col gap-2">
          <Button variant="secondary" onClick={() => { setPwdTarget("user"); setPasswordOpen(true); }} className="justify-start font-semibold">Đổi mật khẩu cá nhân</Button>
          <Button variant="secondary" onClick={() => { setPwdTarget("couple"); setPasswordOpen(true); }} className="justify-start font-semibold">Đổi mã cặp đôi chung</Button>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Download className="h-4 w-4" /> Dữ liệu & Hệ thống
        </h3>
        <div className="flex flex-col gap-2">
          <Button variant="secondary" onClick={handleExport} className="justify-start font-semibold">Xuất dữ liệu dự phòng (JSON)</Button>
          <Button variant="danger" onClick={() => setDeleteOpen(true)} className="justify-start font-semibold">Xóa vĩnh viễn dữ liệu app</Button>
        </div>
      </Card>

      <div className="flex flex-col gap-2 pt-2">
        <Button variant="secondary" onClick={() => setAboutOpen(true)} className="flex items-center gap-2 justify-center"><Info className="h-5 w-5" /> Về ứng dụng MyLove</Button>
        <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2 text-destructive hover:bg-destructive/6 justify-center"><LogOut className="h-5 w-5" /> Đăng xuất khỏi app</Button>
      </div>

      <BottomSheet isOpen={passwordOpen} onClose={() => setPasswordOpen(false)} title={pwdTarget === "couple" ? "Đổi mã cặp đôi chung" : "Đổi mật khẩu cá nhân"}>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Mật khẩu hiện tại</label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Mật khẩu mới</label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <Button type="submit" loading={loading} className="w-full">Lưu mật khẩu mới</Button>
        </form>
      </BottomSheet>

      <Dialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Xác nhận xóa toàn bộ dữ liệu?">
        <p className="text-sm text-muted-foreground leading-relaxed">Hành động này sẽ xóa vĩnh viễn tài khoản cặp đôi của bạn, mọi kỷ niệm, hình ảnh trên Vercel Blob và dữ liệu liên quan. Hành động không thể hoàn tác!</p>
        <div className="flex gap-3 mt-5">
          <Button variant="ghost" onClick={() => setDeleteOpen(false)} className="flex-1">Hủy bỏ</Button>
          <Button variant="danger" loading={loading} onClick={handleDeleteAll} className="flex-1">Xóa vĩnh viễn</Button>
        </div>
      </Dialog>

      <Dialog isOpen={aboutOpen} onClose={() => setAboutOpen(false)} title="Về ứng dụng MyLove">
        <div className="text-sm text-foreground/90 space-y-3 leading-relaxed">
          <p><strong>MyLove</strong> là không gian riêng tư được thiết kế dưới dạng ứng dụng mobile dành riêng cho hai người.</p>
          <p>Ứng dụng hỗ trợ lưu trữ kỷ niệm, gửi ting ting ngắn, chia sẻ lời nhắn yêu thương, đếm ngày yêu và countdown sự kiện quan trọng.</p>
          <div className="border-t pt-3 flex flex-col gap-1 text-[11px] text-muted-foreground">
            <span>Phiên bản: 1.0.0 (Greenfield App)</span>
            <span>Công nghệ: Next.js + Tailwind + Prisma + Vercel</span>
            <span>Made with love ♥</span>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setAboutOpen(false)} className="w-full mt-5">Đóng</Button>
      </Dialog>
    </ScreenContainer>
  );
}
