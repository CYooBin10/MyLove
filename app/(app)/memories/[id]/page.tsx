"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Images, Plus, Tag, Trash2, X } from "lucide-react";
import { ScreenContainer } from "@/components/shell/screen-container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/client-api";
import { formatDate } from "@/lib/dates";
import type { MemoryWithUser, GalleryWithRelations } from "@/lib/types";

type MemoryDetail = MemoryWithUser;

export default function MemoryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const memoryId = params.id;

  const [memory, setMemory] = useState<MemoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<GalleryWithRelations | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchMemory = async () => {
    try {
      const res = await apiFetch<{ memory: MemoryDetail }>(`/api/memories/${memoryId}`);
      setMemory(res.memory);
    } catch (err: any) {
      toast.push(err.message || "Không thể tải album kỷ niệm.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memoryId) fetchMemory();
  }, [memoryId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const uploadRes = await apiFetch<{ uploads: { url: string; pathname: string }[] }>("/api/upload", {
        method: "POST",
        body: formData,
      });

      await apiFetch("/api/gallery", {
        method: "POST",
        body: JSON.stringify({
          images: uploadRes.uploads.map((item) => ({ ...item, memoryId })),
        }),
      });

      toast.push(`Đã thêm ${files.length} ảnh vào album.`);
      setFiles([]);
      setUploadOpen(false);
      fetchMemory();
    } catch (err: any) {
      toast.push(err.message || "Tải ảnh thất bại.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!window.confirm("Xóa ảnh này khỏi album?")) return;
    try {
      await apiFetch(`/api/gallery/${imageId}`, { method: "DELETE" });
      toast.push("Đã xóa ảnh.");
      setActiveImage(null);
      fetchMemory();
    } catch {
      toast.push("Không thể xóa ảnh.", "error");
    }
  };

  if (loading) {
    return <ScreenContainer className="pt-10 text-center text-sm text-muted-foreground">Đang tải album...</ScreenContainer>;
  }

  if (!memory) {
    return <ScreenContainer className="pt-10 text-center text-sm text-muted-foreground">Không tìm thấy kỷ niệm.</ScreenContainer>;
  }

  return (
    <ScreenContainer className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="px-0">
          <ArrowLeft className="mr-1 h-4 w-4" /> Quay lại
        </Button>
        <Button size="sm" onClick={() => setUploadOpen(true)} className="rounded-full shadow-soft flex items-center gap-1">
          <Plus className="h-4 w-4" /> Thêm ảnh
        </Button>
      </div>

      {memory.coverImageUrl ? (
        <Card className="overflow-hidden p-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={memory.coverImageUrl} alt={memory.title} className="h-52 w-full object-cover" />
        </Card>
      ) : null}

      <Card className="p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(memory.happenedAt)}</span>
          <span>•</span>
          <span>{memory.gallery.length} ảnh</span>
        </div>
        <h2 className="mt-2 text-xl font-bold text-foreground">{memory.title}</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">{memory.description}</p>
        {memory.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {memory.tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                <Tag className="h-2.5 w-2.5" /> {t}
              </span>
            ))}
          </div>
        ) : null}
      </Card>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Images className="h-4 w-4" /> Ảnh trong album
        </h3>
        {memory.gallery.length === 0 ? (
          <EmptyState title="Album chưa có ảnh" description="Thêm vài tấm để lưu lại câu chuyện này." action={<Button onClick={() => setUploadOpen(true)}>Thêm ảnh</Button>} />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {memory.gallery.map((img) => (
              <Card key={img.id} onClick={() => setActiveImage(img as GalleryWithRelations)} className="overflow-hidden p-0 cursor-pointer aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.caption || ""} className="h-full w-full object-cover" loading="lazy" />
              </Card>
            ))}
          </div>
        )}
      </div>

      {activeImage ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/96 px-4 py-8 animate-fadeIn" onClick={() => setActiveImage(null)}>
          <button onClick={() => setActiveImage(null)} className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition">
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-h-[75vh] max-w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={activeImage.url} alt="" className="max-h-[75vh] max-w-full rounded-2xl object-contain border border-white/10" />
          </div>
          <div className="mt-6 text-center text-white max-w-xs" onClick={(e) => e.stopPropagation()}>
            {activeImage.caption ? <p className="text-sm font-semibold">{activeImage.caption}</p> : null}
            <button onClick={() => handleDeleteImage(activeImage.id)} className="mt-4 inline-flex items-center gap-1 rounded-full bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 border border-red-500/20 active:scale-95 transition">
              <Trash2 className="h-3.5 w-3.5" /> Xóa ảnh này
            </button>
          </div>
        </div>
      ) : null}

      <BottomSheet isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Thêm ảnh vào album">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted-foreground">Chọn nhiều ảnh</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="block w-full rounded-2xl border border-input bg-muted/20 px-4 py-3 text-sm"
            />
          </div>
          {files.length > 0 ? (
            <div className="rounded-2xl border bg-muted/10 p-3 text-sm text-muted-foreground">
              Đã chọn {files.length} ảnh.
            </div>
          ) : null}
          <Button type="submit" loading={uploading} disabled={files.length === 0} className="w-full">
            Tải {files.length || ""} ảnh lên album
          </Button>
        </form>
      </BottomSheet>
    </ScreenContainer>
  );
}
