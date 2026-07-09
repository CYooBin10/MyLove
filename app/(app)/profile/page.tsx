"use client";

import { useState } from "react";
import { Edit2, Heart } from "lucide-react";
import { ScreenContainer } from "@/components/shell/screen-container";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useToast } from "@/components/ui/toast";
import { useSessionState } from "@/components/providers/app-providers";
import { apiFetch } from "@/lib/client-api";
import { formatDate } from "@/lib/dates";

export default function ProfilePage() {
  const { session, refreshSession } = useSessionState();
  const toast = useToast();
  const couple = session.couple;
  const users = couple?.users || [];

  const [activeUser, setActiveUser] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [birthday, setBirthday] = useState("");
  const [favoriteColor, setFavoriteColor] = useState("");
  const [noteAbout, setNoteAbout] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [editCoupleOpen, setEditCoupleOpen] = useState(false);
  const [coupleName, setCoupleName] = useState("");
  const [startDate, setStartDate] = useState("");

  const startEditUser = (user: any) => {
    setActiveUser(user);
    setName(user.name || "");
    setNickname(user.nickname || "");
    setBirthday(user.birthday ? new Date(user.birthday).toISOString().slice(0, 10) : "");
    setFavoriteColor(user.favoriteColor || "");
    setNoteAbout(user.noteAbout || "");
    setAvatarUrl(user.avatarUrl || "");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiFetch<{ url: string }>("/api/upload", {
        method: "POST",
        body: formData,
      });
      setAvatarUrl(res.url);
      toast.push("Đã tải lên ảnh đại diện.");
    } catch (err: any) {
      toast.push(err.message || "Tải ảnh thất bại.", "error");
    } finally {
      setUploading(false);
    }
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch(`/api/couple/users/${activeUser.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name,
          nickname: nickname || null,
          birthday: birthday || null,
          favoriteColor: favoriteColor || null,
          noteAbout: noteAbout || null,
          avatarUrl: avatarUrl || null,
        }),
      });
      toast.push("Đã lưu thông tin.");
      await refreshSession();
      setActiveUser(null);
    } catch (err: any) {
      toast.push(err.message || "Lỗi lưu thông tin.", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveCouple = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/api/couple", {
        method: "PATCH",
        body: JSON.stringify({
          displayName: coupleName,
          startDate,
        }),
      });
      toast.push("Đã lưu thông tin cặp đôi.");
      await refreshSession();
      setEditCoupleOpen(false);
    } catch (err: any) {
      toast.push(err.message || "Lỗi lưu thông tin.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Couple Profile</h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setCoupleName(couple?.displayName || "");
            setStartDate(couple?.startDate ? new Date(couple.startDate).toISOString().slice(0, 10) : "");
            setEditCoupleOpen(true);
          }}
        >
          Sửa Cặp Đôi
        </Button>
      </div>

      {couple ? (
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <Heart className="h-8 w-8 text-primary animate-pulse mb-3" />
          <h3 className="text-lg font-bold">{couple.displayName}</h3>
          <p className="text-sm text-muted-foreground mt-1">Bên nhau từ {formatDate(couple.startDate)}</p>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4">
        {users.map((user) => (
          <Card key={user.id} className="relative overflow-hidden p-6">
            <button
              type="button"
              onClick={() => startEditUser(user)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:text-foreground active:scale-95 transition"
            >
              <Edit2 className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4">
              <Avatar src={user.avatarUrl} name={user.name} size="xl" className="ring-2 ring-primary/10" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Slot {user.slot}</p>
                <h4 className="text-lg font-bold text-foreground truncate">{user.name}</h4>
                {user.nickname ? (
                  <p className="text-sm text-muted-foreground truncate">Nickname: {user.nickname}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-5 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sinh nhật:</span>
                <span className="font-medium">{formatDate(user.birthday)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Màu yêu thích:</span>
                <span className="font-medium" style={{ color: user.favoriteColor || "inherit" }}>
                  {user.favoriteColor || "Chưa chọn"}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Đôi nét về {user.name}:
                </p>
                <p className="italic text-foreground/80 leading-relaxed bg-muted/20 p-3 rounded-2xl border">
                  {user.noteAbout || "Chưa có ghi chú."}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* User edit Bottom Sheet */}
      <BottomSheet isOpen={!!activeUser} onClose={() => setActiveUser(null)} title={`Sửa hồ sơ: ${activeUser?.name}`}>
        <form onSubmit={saveUser} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Ảnh đại diện</label>
            <div className="flex items-center gap-4">
              <Avatar src={avatarUrl} name={name} size="lg" />
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <Button type="button" variant="secondary" size="sm" loading={uploading}>
                  Chọn ảnh
                </Button>
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Tên hiển thị</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Biệt danh (Nickname)</label>
            <Input value={nickname} onChange={(e) => setNickname(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Sinh nhật</label>
            <Input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Màu yêu thích</label>
            <Input placeholder="Ví dụ: Hồng, Blue..." value={favoriteColor} onChange={(e) => setFavoriteColor(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Ghi chú nhỏ về nhau</label>
            <Textarea value={noteAbout} onChange={(e) => setNoteAbout(e.target.value)} rows={3} placeholder="Sở thích, món ăn thích..." />
          </div>
          <Button type="submit" loading={loading} className="w-full">
            Lưu thay đổi
          </Button>
        </form>
      </BottomSheet>

      {/* Couple edit Bottom Sheet */}
      <BottomSheet isOpen={editCoupleOpen} onClose={() => setEditCoupleOpen(false)} title="Sửa thông tin cặp đôi">
        <form onSubmit={saveCouple} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Tên cặp đôi</label>
            <Input value={coupleName} onChange={(e) => setCoupleName(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Ngày bắt đầu yêu</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </div>
          <Button type="submit" loading={loading} className="w-full">
            Lưu thông tin cặp đôi
          </Button>
        </form>
      </BottomSheet>
    </ScreenContainer>
  );
}
