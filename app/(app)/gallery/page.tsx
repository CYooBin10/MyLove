"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FolderHeart, Images, Plus, Trash2, X } from "lucide-react";
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

type UploadResult = { url: string; pathname: string };
type Tab = "photos" | "albums";

export default function GalleryPage() {
  const toast = useToast();
  const [images, setImages] = useState<GalleryWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<GalleryWithRelations | null>(null);
  const [tab, setTab] = useState<Tab>("photos");

  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
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

  const albums = useMemo(() => {
    const map = new Map<string, { memory: NonNullable<GalleryWithRelations["memory"]>; photos: GalleryWithRelations[] }>();
    images.forEach((img) => {
      if (!img.memory) return;
      const current = map.get(img.memory.id) || { memory: img.memory, photos: [] };
      current.photos.push(img);
      map.set(img.memory.id, current);
    });
    return Array.from(map.values()).sort((a, b) => b.photos.length - a.photos.length);
  }, [images]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const uploadRes = await apiFetch<{ uploads: UploadResult[] }>("/api/upload", {
        method: "POST",
        body: formData,
      });

      await apiFetch("/api/gallery", {
        method: "POST",
        body: JSON.stringify({
          images: uploadRes.uploads.map((img) => ({ ...img, caption: caption || null })),
        }),
      });

      toast.push(`Đã tải lên ${files.length} ảnh.`);
      setUploadOpen(false);
      setFiles([]);
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

      <div className="grid grid-cols-2 rounded-2xl bg-muted/50 p-1 text-sm font-semibold">
        <button type="button" onClick={() => setTab("photos")} className={`h-10 rounded-xl transition ${tab === "photos" ? "bg-card text-primary shadow-soft" : "text-muted-foreground"}`}>
          Ảnh ({images.length})
        </button>
        <button type="button" onClick={() => setTab("albums")} className={`h-10 rounded-xl transition ${tab === "albums" ? "bg-card text-primary shadow-soft" : "text-muted-foreground"}`}>
          Albums ({albums.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center text-sm text-muted-foreground pt-10">Đang tải thư viện ảnh...</div>
      ) : tab === "photos" ? (
        images.length === 0 ? (
          <EmptyState icon={<Images className="h-12 w-12" />} title="Thư viện trống" description="Lưu giữ khoảnh khắc ngọt ngào của hai đứa tại đây." action={<Button onClick={() => setUploadOpen(true)}>Tải ảnh lên</Button>} />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {images.map((img) => (
              <Card key={img.id} onClick={() => setActiveImage(img)} className="overflow-hidden p-0 cursor-pointer border-border/80 hover:scale-[1.01] active:scale-[0.99] transition relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.caption || ""} className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 pt-8 text-[11px] text-white">
                  <p className="line-clamp-1">{img.caption || img.memory?.title || "Ảnh MyLove"}</p>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : albums.length === 0 ? (
        <EmptyState icon={<FolderHeart className="h-12 w-12" />} title="Chưa có album" description="Album được tạo tự động từ các ảnh gắn với từng kỷ niệm." />
      ) : (
        <div className="space-y-3">
          {albums.map((album) => {
            const cover = album.photos[0];
            return (
              <Link key={album.memory.id} href={`/memories/${album.memory.id}`}>
                <Card className="flex gap-4 overflow-hidden p-3 active:scale-[0.99] transition">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover.url} alt={album.memory.title} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 py-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">Album kỷ niệm</p>
                    <h3 className="mt-1 line-clamp-2 font-bold text-foreground">{album.memory.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{album.photos.length} ảnh • {formatDate(album.memory.happenedAt)}</p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

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
            {activeImage.caption || activeImage.memory?.title ? <p className="text-sm font-semibold">{activeImage.caption || activeImage.memory?.title}</p> : null}
            <p className="text-[10px] text-white/50 mt-1">
              Đăng bởi {activeImage.uploadedBy?.name || "Bạn"} • {formatDate(activeImage.createdAt, "HH:mm dd/MM/yyyy")}
            </p>
            {activeImage.memory ? (
              <Link href={`/memories/${activeImage.memory.id}`} className="mt-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white border border-white/15 active:scale-95 transition">
                Mở album
              </Link>
            ) : null}
            <button onClick={() => handleDelete(activeImage.id)} className="ml-2 mt-3 inline-flex items-center gap-1 rounded-full bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 border border-red-500/20 active:scale-95 transition">
              <Trash2 className="h-3.5 w-3.5" /> Xóa ảnh
            </button>
          </div>
        </div>
      ) : null}

      <BottomSheet isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Tải nhiều ảnh lên thư viện">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted-foreground">Chọn nhiều file ảnh</label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 hover:bg-muted/10 transition cursor-pointer relative min-h-[140px]">
              <div className="text-center pointer-events-none">
                <Images className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
                <p className="text-sm font-semibold text-muted-foreground">{files.length ? `Đã chọn ${files.length} ảnh` : "Bấm chọn nhiều ảnh"}</p>
                <p className="text-xs text-muted-foreground/80 mt-0.5">JPEG, PNG, WEBP. Tối đa 8MB/ảnh.</p>
              </div>
              <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Caption chung (tùy chọn)</label>
            <Input placeholder="Một ngày nắng đẹp..." value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>

          <Button type="submit" loading={uploading} disabled={files.length === 0} className="w-full">
            Tải {files.length || ""} ảnh lên
          </Button>
        </form>
      </BottomSheet>
    </ScreenContainer>
  );
}
