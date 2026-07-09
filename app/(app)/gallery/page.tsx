"use client";

import { useEffect, useState } from "react";
import { Images, Plus, Trash2, X } from "lucide-react";
import { ScreenContainer } from "@/components/shell/screen-container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/client-api";
import { formatDate } from "@/lib/dates";
import type { GalleryWithRelations } from "@/lib/types";

export default function GalleryPage() {
  const toast = useToast();

  const [images, setImages] = useState<GalleryWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<GalleryWithRelations | null>(null);

  // Form upload states
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchImages = async () => {
    try {
      const res = await apiFetch<{ images: GalleryWithRelations[] }>("/api/gallery");
      setImages(res.images);
    } catch {
      toast.push("Lỗi tải thư viện ảnh.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await apiFetch<{ url: string; pathname: string }>("/api/upload", {
        method: "POST",
        body: formData,
      });

      await apiFetch("/api/gallery", {
        method: "POST",
        body: JSON.stringify({
          url: uploadRes.url,
          pathname: uploadRes.pathname,
          caption: caption || null,
        }),
      });

      toast.push("Tải lên thành công!");
      setUploadOpen(false);
      setFile(null);
      setCaption("");
      fetchImages();
    } catch (err: any) {
      toast.push(err.message || "Tải lên ảnh thất bại.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn muốn xóa ảnh này khỏi thư viện?")) return;
    try {
      await apiFetch(`/api/gallery/${id}`, { method: "DELETE" });
      toast.push("Đã xóa ảnh.");
      setActiveImage(null);
      fetchImages();
    } catch {
      toast.push("Không thể xóa ảnh.", "error");
    }
  };

  return (
    <ScreenContainer className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Thư viện ảnh</h2>
        <Button onClick={() => setUploadOpen(true)} size="sm" className="rounded-full shadow-soft flex items-center gap-1">
          <Plus className="h-4 w-4" /> Tải ảnh lên
        </Button>
      </div>

      {loading ? (
        <div className="text-center text-sm text-muted-foreground pt-10">Đang tải thư viện ảnh...</div>
      ) : images.length === 0 ? (
        <EmptyState
          icon={<Images className="h-12 w-12" />}
          title="Thư viện trống"
          description="Lưu giữ khoảnh khắc ngọt ngào của hai đứa tại đây."
          action={<Button onClick={() => setUploadOpen(true)}>Tải ảnh lên</Button>}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {images.map((img) => (
            <Card
              key={img.id}
              onClick={() => setActiveImage(img)}
              className="overflow-hidden p-0 cursor-pointer border-border/80 hover:scale-[1.01] active:scale-[0.99] transition relative aspect-square"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.caption || ""} className="h-full w-full object-cover" loading="lazy" />
              {img.caption ? (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-6 text-[11px] text-white">
                  <p className="line-clamp-1">{img.caption}</p>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      {/* Lightbox / Fullscreen Viewer */}
      {activeImage ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/96 px-4 py-8 animate-fadeIn" onClick={() => setActiveImage(null)}>
          <button
            onClick={() => setActiveImage(null)}
            className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-h-[75vh] max-w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={activeImage.url} alt="" className="max-h-[75vh] max-w-full rounded-2xl object-contain border border-white/10" />
          </div>
          <div className="mt-6 text-center text-white max-w-xs" onClick={(e) => e.stopPropagation()}>
            {activeImage.caption ? <p className="text-sm font-semibold">{activeImage.caption}</p> : null}
            <p className="text-[10px] text-white/50 mt-1">
              Đăng bởi {activeImage.uploadedBy?.name || "Bạn"} • {formatDate(activeImage.createdAt, "HH:mm dd/MM/yyyy")}
            </p>
            <button
              onClick={() => handleDelete(activeImage.id)}
              className="mt-4 inline-flex items-center gap-1 rounded-full bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 border border-red-500/20 active:scale-95 transition"
            >
              <Trash2 className="h-3.5 w-3.5" /> Xóa ảnh này
            </button>
          </div>
        </div>
      ) : null}

      {/* Upload Bottom Sheet */}
      <BottomSheet isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Tải ảnh lên thư viện">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted-foreground">Chọn file ảnh</label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 hover:bg-muted/10 transition cursor-pointer relative min-h-[140px]">
              {file ? (
                <div className="text-center">
                  <p className="text-sm font-bold text-primary truncate max-w-xs">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button type="button" onClick={() => setFile(null)} className="mt-2 text-xs text-red-500 hover:underline">Xóa file</button>
                </div>
              ) : (
                <div className="text-center pointer-events-none">
                  <Images className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-muted-foreground">Bấm chọn hoặc kéo thả ảnh vào đây</p>
                  <p className="text-xs text-muted-foreground/80 mt-0.5">Định dạng hỗ trợ: JPEG, PNG, WEBP (Tối đa 8MB)</p>
                </div>
              )}
              {!file ? (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
              ) : null}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Mô tả caption ngắn</label>
            <Input placeholder="Một ngày nắng đẹp..." value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>

          <Button type="submit" loading={uploading} disabled={!file} className="w-full">
            Bắt đầu tải lên
          </Button>
        </form>
      </BottomSheet>
    </ScreenContainer>
  );
}
