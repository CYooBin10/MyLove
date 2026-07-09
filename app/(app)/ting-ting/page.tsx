"use client";

import { useEffect, useState } from "react";
import { BellRing, Send, Sparkles } from "lucide-react";
import { ScreenContainer } from "@/components/shell/screen-container";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useSessionState } from "@/components/providers/app-providers";
import { apiFetch } from "@/lib/client-api";
import { TING_PRESETS } from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import type { TingWithSender } from "@/lib/types";

export default function TingTingPage() {
  const { session, refreshSession } = useSessionState();
  const toast = useToast();
  const me = session.user;

  const [tingTings, setTingTings] = useState<TingWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [customMsg, setCustomMsg] = useState("");
  const [sending, setSending] = useState(false);

  const fetchTings = async () => {
    try {
      const res = await apiFetch<{ tingTings: TingWithSender[] }>("/api/ting-ting");
      setTingTings(res.tingTings);
    } catch {
      toast.push("Lỗi tải lịch sử Ting Ting.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTings();
    // Mark all as read when entering page
    const markRead = async () => {
      try {
        await apiFetch("/api/ting-ting", { method: "PATCH", body: JSON.stringify({}) });
        await refreshSession();
      } catch {}
    };
    markRead();
  }, []);

  const sendTing = async (type: string, message?: string | null) => {
    setSending(true);
    try {
      await apiFetch("/api/ting-ting", {
        method: "POST",
        body: JSON.stringify({ type, message }),
      });
      toast.push("Đã gửi Ting Ting!");
      setCustomMsg("");
      fetchTings();
    } catch (err: any) {
      toast.push(err.message || "Lỗi gửi Ting Ting.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <ScreenContainer className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Ting Ting</h2>
        <p className="text-xs text-muted-foreground mt-1">Gửi thông báo & tin nhắn ngắn tạo rung/ting ngay trên máy đối phương</p>
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1">
          <Sparkles className="h-4 w-4 text-primary" /> Chọn loại Ting Ting
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {TING_PRESETS.map((p) => (
            <Button
              key={p.type}
              variant="secondary"
              className="rounded-2xl min-h-14 font-semibold hover:border-primary/40 active:bg-primary/5 active:border-primary transition"
              onClick={() => sendTing(p.type, p.label)}
              disabled={sending}
            >
              <span>{p.label}</span>
            </Button>
          ))}
        </div>

        <div className="mt-5 border-t pt-4">
          <label className="mb-2 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hoặc lời nhắn tự chọn</label>
          <div className="flex gap-2">
            <Input
              placeholder="Nhập lời nhắn ngắn (tối đa 40 ký tự)..."
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value.slice(0, 40))}
              disabled={sending}
            />
            <Button size="icon" onClick={() => sendTing("CUSTOM", customMsg)} disabled={!customMsg.trim() || sending} className="rounded-full shrink-0">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <BellRing className="h-4 w-4" /> Lịch sử Ting Ting
        </h3>

        {loading ? (
          <div className="text-center text-sm text-muted-foreground py-8">Đang tải lịch sử...</div>
        ) : tingTings.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">Chưa có thông báo nào.</Card>
        ) : (
          <div className="space-y-2">
            {tingTings.map((ting) => {
              const isMe = ting.senderId === me?.id;
              return (
                <Card key={ting.id} className="flex items-center justify-between p-4 bg-card/60">
                  <div className="flex items-center gap-3">
                    <Avatar src={ting.sender?.avatarUrl} name={ting.sender?.name} size="sm" />
                    <div>
                      <p className="text-sm font-semibold">
                        {isMe ? "Bạn đã gửi" : `${ting.sender?.name} đã gửi`}:{" "}
                        <span className="text-primary font-bold">{ting.message || "Ting Ting"}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(ting.createdAt, "HH:mm dd/MM/yyyy")}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ScreenContainer>
  );
}
