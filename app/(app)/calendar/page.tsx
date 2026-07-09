"use client";

import { useEffect, useState } from "react";
import { CalendarHeart, Plus, Trash2 } from "lucide-react";
import { ScreenContainer } from "@/components/shell/screen-container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { useSessionState } from "@/components/providers/app-providers";
import { apiFetch } from "@/lib/client-api";
import { formatDate, getCountdownLabel } from "@/lib/dates";
import { SPECIAL_DAY_TYPES } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

type SpecialDay = Prisma.SpecialDayGetPayload<{}>;

export default function CalendarPage() {
  const { session } = useSessionState();
  const toast = useToast();

  const [days, setDays] = useState<SpecialDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<SpecialDay | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<"ANNIVERSARY" | "BIRTHDAY" | "DATE" | "TRIP" | "CUSTOM">("CUSTOM");
  const [note, setNote] = useState("");
  const [repeatsYearly, setRepeatsYearly] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchDays = async () => {
    try {
      const res = await apiFetch<{ specialDays: SpecialDay[] }>("/api/special-days");
      setDays(res.specialDays);
    } catch {
      toast.push("Lỗi tải danh sách ngày đặc biệt.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDays();
  }, []);

  const openCreate = () => {
    setEditingDay(null);
    setTitle("");
    setDate(new Date().toISOString().slice(0, 10));
    setType("ANNIVERSARY");
    setNote("");
    setRepeatsYearly(true);
    setFormOpen(true);
  };

  const openEdit = (day: SpecialDay) => {
    setEditingDay(day);
    setTitle(day.title);
    setDate(new Date(day.date).toISOString().slice(0, 10));
    setType(day.type as any);
    setNote(day.note || "");
    setRepeatsYearly(day.repeatsYearly);
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) {
      toast.push("Vui lòng điền tiêu đề và ngày tháng.", "error");
      return;
    }
    setSaving(true);
    try {
      if (editingDay) {
        await apiFetch(`/api/special-days/${editingDay.id}`, {
          method: "PATCH",
          body: JSON.stringify({ title, date, type, note: note || null, repeatsYearly }),
        });
        toast.push("Đã cập nhật ngày đặc biệt.");
      } else {
        await apiFetch("/api/special-days", {
          method: "POST",
          body: JSON.stringify({ title, date, type, note: note || null, repeatsYearly }),
        });
        toast.push("Đã thêm ngày đặc biệt mới!");
      }
      setFormOpen(false);
      fetchDays();
    } catch (err: any) {
      toast.push(err.message || "Lỗi lưu thông tin.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn muốn xóa ngày đặc biệt này?")) return;
    try {
      await apiFetch(`/api/special-days/${id}`, { method: "DELETE" });
      toast.push("Đã xóa ngày đặc biệt.");
      fetchDays();
    } catch {
      toast.push("Không thể xóa.", "error");
    }
  };

  return (
    <ScreenContainer className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Ngày quan trọng</h2>
        <Button onClick={openCreate} size="sm" className="rounded-full shadow-soft flex items-center gap-1">
          <Plus className="h-4 w-4" /> Thêm ngày
        </Button>
      </div>

      {loading ? (
        <div className="text-center text-sm text-muted-foreground pt-10">Đang tải danh sách ngày đặc biệt...</div>
      ) : days.length === 0 ? (
        <EmptyState
          icon={<CalendarHeart className="h-12 w-12" />}
          title="Chưa có ngày đặc biệt nào"
          description="Hãy tạo nhắc nhở sinh nhật, ngày kỷ niệm yêu nhau, ngày hẹn hò sắp tới..."
          action={<Button onClick={openCreate}>Thêm ngày quan trọng</Button>}
        />
      ) : (
        <div className="space-y-3">
          {days.map((day) => {
            const countdown = getCountdownLabel(day.date, day.repeatsYearly);
            const isToday = countdown === "Hôm nay";

            return (
              <Card
                key={day.id}
                onClick={() => openEdit(day)}
                className={`flex items-center justify-between p-4 cursor-pointer hover:border-primary/45 transition ${
                  isToday ? "bg-primary/5 border-primary/20 ring-1 ring-primary/10" : ""
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold">{day.title}</h3>
                    <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[9px] font-bold text-primary">
                      {SPECIAL_DAY_TYPES.find((t) => t.value === day.type)?.label || day.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ngày: {formatDate(day.date)} {day.repeatsYearly ? "(Lặp lại hàng năm)" : ""}
                  </p>
                  {day.note ? <p className="text-xs text-muted-foreground/80 mt-1 italic">“{day.note}”</p> : null}
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${isToday ? "bg-primary text-primary-foreground animate-pulse" : "bg-muted text-muted-foreground"}`}>
                    {countdown}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(day.id);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-destructive hover:bg-destructive/8 active:scale-95 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Bottom Sheet */}
      <BottomSheet isOpen={formOpen} onClose={() => setFormOpen(false)} title={editingDay ? "Sửa ngày quan trọng" : "Thêm ngày quan trọng"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Tiêu đề</label>
            <Input placeholder="Sinh nhật em bé, Kỷ niệm yêu nhau..." value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Ngày quan trọng</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Loại ngày</label>
            <select
              value={type}
              onChange={(e: any) => setType(e.target.value)}
              className="flex h-12 w-full rounded-2xl border border-input bg-muted/20 px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
            >
              {SPECIAL_DAY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between border-t border-b py-3">
            <div>
              <p className="text-sm font-semibold">Lặp lại hàng năm</p>
              <p className="text-xs text-muted-foreground mt-0.5">Tự động tính ngày đếm ngược cho năm tiếp theo</p>
            </div>
            <input
              type="checkbox"
              checked={repeatsYearly}
              onChange={(e) => setRepeatsYearly(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Ghi chú nhỏ (Tùy chọn)</label>
            <Textarea placeholder="Mua quà, hoa, chuẩn bị bánh..." value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </div>

          <Button type="submit" loading={saving} className="w-full">
            {editingDay ? "Lưu thay đổi" : "Tạo nhắc nhở"}
          </Button>
        </form>
      </BottomSheet>
    </ScreenContainer>
  );
}
