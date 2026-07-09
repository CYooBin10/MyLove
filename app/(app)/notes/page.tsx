"use client";

import { useEffect, useState } from "react";
import { Send, Trash2, Pin, CheckCircle2 } from "lucide-react";
import { ScreenContainer } from "@/components/shell/screen-container";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { useSessionState } from "@/components/providers/app-providers";
import { apiFetch } from "@/lib/client-api";
import { formatDate } from "@/lib/dates";
import type { NoteWithSender } from "@/lib/types";

export default function NotesPage() {
  const { session } = useSessionState();
  const toast = useToast();
  const me = session.user;

  const [notes, setNotes] = useState<NoteWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const fetchNotes = async () => {
    try {
      const res = await apiFetch<{ notes: NoteWithSender[] }>("/api/notes");
      setNotes(res.notes);
    } catch {
      toast.push("Lỗi tải danh sách lời nhắn.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setSending(true);
    try {
      await apiFetch("/api/notes", {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      setBody("");
      toast.push("Đã gửi lời nhắn!");
      fetchNotes();
    } catch (err: any) {
      toast.push(err.message || "Lỗi gửi lời nhắn.", "error");
    } finally {
      setSending(false);
    }
  };

  const handlePin = async (id: string, currentPinned: boolean) => {
    try {
      await apiFetch(`/api/notes/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ pinned: !currentPinned }),
      });
      toast.push(currentPinned ? "Đã bỏ ghim." : "Đã ghim lời nhắn.");
      fetchNotes();
    } catch {
      toast.push("Lỗi ghim lời nhắn.", "error");
    }
  };

  const handleRead = async (id: string, currentRead: boolean) => {
    if (currentRead) return;
    try {
      await apiFetch(`/api/notes/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ read: true }),
      });
      fetchNotes();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn muốn xóa lời nhắn này?")) return;
    try {
      await apiFetch(`/api/notes/${id}`, { method: "DELETE" });
      toast.push("Đã xóa lời nhắn.");
      fetchNotes();
    } catch {
      toast.push("Không thể xóa.", "error");
    }
  };

  return (
    <ScreenContainer className="flex flex-col h-[calc(100dvh-6rem)] md:h-[calc(100dvh-9rem)]">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-foreground">Lời nhắn yêu thương</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
        {loading ? (
          <div className="text-center text-sm text-muted-foreground pt-10">Đang tải lời nhắn...</div>
        ) : notes.length === 0 ? (
          <EmptyState title="Chưa có lời nhắn nào" description="Gửi lời nhắn yêu thương đầu tiên cho nửa kia ở khung chat dưới nhé." />
        ) : (
          notes.map((note) => {
            const isMe = note.senderId === me?.id;
            return (
              <div
                key={note.id}
                onClick={() => !isMe && handleRead(note.id, !!note.readAt)}
                className={`flex gap-3 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <Avatar src={note.sender?.avatarUrl} name={note.sender?.name} size="sm" className="mt-1" />
                <div className="space-y-1">
                  <div
                    className={`relative rounded-2xl px-4 py-3 text-sm shadow-soft group border ${
                      isMe
                        ? "bg-primary text-primary-foreground border-transparent rounded-tr-none"
                        : "bg-card text-foreground rounded-tl-none border-border/80"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{note.body}</p>

                    <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition flex items-center gap-1.5 bg-background/80 dark:bg-card/90 px-1.5 py-0.5 rounded-full border shadow-soft">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePin(note.id, note.pinned);
                        }}
                        className={`hover:scale-115 transition ${note.pinned ? "text-primary" : "text-muted-foreground"}`}
                      >
                        <Pin className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(note.id);
                        }}
                        className="text-destructive hover:scale-115 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className={`flex items-center gap-1.5 text-[10px] text-muted-foreground ${isMe ? "justify-end" : "justify-start"}`}>
                    <span>{formatDate(note.createdAt, "HH:mm dd/MM")}</span>
                    {note.pinned ? <Pin className="h-2.5 w-2.5 text-primary fill-current" /> : null}
                    {!isMe && note.readAt ? <CheckCircle2 className="h-2.5 w-2.5 text-green-500" /> : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="mt-auto border-t border-border/70 pt-4 bg-background">
        <div className="flex gap-2 items-end">
          <Textarea
            placeholder="Viết lời nhắn gửi người thương..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={1}
            className="flex-1 min-h-[44px]"
            required
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <Button type="submit" size="icon" loading={sending} className="rounded-full shrink-0">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </ScreenContainer>
  );
}
