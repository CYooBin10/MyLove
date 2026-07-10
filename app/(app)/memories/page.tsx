"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, Heart, Images, Plus, Search, Tag, Trash2 } from "lucide-react";
import { ScreenContainer } from "@/components/shell/screen-container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/client-api";
import { formatDate } from "@/lib/dates";
import { MEMORY_TAGS } from "@/lib/constants";
import type { MemoryWithUser } from "@/lib/types";

type UploadResult = { url: string; pathname: string };

export default function MemoriesPage() {
  const toast = useToast();
  const [memories, setMemories] = useState<MemoryWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryWithUser | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [happenedAt, setHappenedAt] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverImagePathname, setCoverImagePathname] = useState("");
  const [albumFiles, setAlbumFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const fetchMemories = async () => {
    try {
      const res = await apiFetch<{ memories: MemoryWithUser[] }>("/api/memories");
      setMemories(res.memories);
    } catch {
      toast.push("Lỗi tải danh sách kỷ niệm.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setHappenedAt(new Date().toISOString().slice(0, 10));
    setTags([]);
    setCoverImageUrl("");
    setCoverImagePathname("");
    setAlbumFiles([]);
  };

  const openCreate = () => {
    setEditingMemory(null);
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (memory: MemoryWithUser) => {
    setEditingMemory(memory);
    setTitle(memory.title);
    setDescription(memory.description);
    setHappenedAt(new Date(memory.happenedAt).toISOString().slice(0, 10));
    setTags(memory.tags);
    setCoverImageUrl(memory.coverImageUrl || "");
    setCoverImagePathname(memory.coverImagePathname || "");
    setAlbumFiles([]);
    setFormOpen(true);
  };

  const toggleTag = (tag: string) => {
    setTags((current) => (current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiFetch<UploadResult>("/api/upload", { method: "POST", body: formData });
      setCoverImageUrl(res.url);
      setCoverImagePathname(res.pathname);
      toast.push("Tải ảnh bìa thành công.");
    } catch (err: any) {
      toast.push(err.message || "Tải ảnh thất bại.", "error");
    } finally {
      setUploading(false);
    }
  };

  const uploadAlbumFiles = async (memoryId: string) => {
    if (albumFiles.length === 0) return;
    const formData = new FormData();
    albumFiles.forEach((file) => formData.append("files", file));
    const uploadRes = await apiFetch<{ uploads: UploadResult[] }>("/api/upload", { method: "POST", body: formData });
    await apiFetch("/api/gallery", {
      method: "POST",
      body: JSON.stringify({ images: uploadRes.uploads.map((img) => ({ ...img, memoryId })) }),
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !happenedAt) {
      toast.push("Vui lòng điền tiêu đề và ngày kỷ niệm.", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = { title, description, happenedAt, tags, coverImageUrl: coverImageUrl || null, coverImagePathname: coverImagePathname || null };
      const res = editingMemory
        ? await apiFetch<{ memory: MemoryWithUser }>(`/api/memories/${editingMemory.id}`, { method: "PATCH", body: JSON.stringify(payload) })
        : await apiFetch<{ memory: MemoryWithUser }>("/api/memories", { method: "POST", body: JSON.stringify(payload) });

      await uploadAlbumFiles(res.memory.id);
      toast.push(editingMemory ? "Đã cập nhật kỷ niệm." : "Đã thêm kỷ niệm mới!");
      setFormOpen(false);
      fetchMemories();
    } catch (err: any) {
      toast.push(err.message || "Lỗi lưu kỷ niệm.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa kỷ niệm này? Ảnh album sẽ được giữ lại trong thư viện chung.")) return;
    try {
      await apiFetch(`/api/memories/${id}`, { method: "DELETE" });
      toast.push("Đã xóa kỷ niệm.");
      fetchMemories();
    } catch {
      toast.push("Không thể xóa kỷ niệm.", "error");
    }
  };

  const filtered = memories.filter((m) => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !selectedTag || m.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <ScreenContainer className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Kỷ niệm</h2>
        <Button onClick={openCreate} size="sm" className="rounded-full shadow-soft flex items-center gap-1">
          <Plus className="h-4 w-4" /> Thêm kỷ niệm
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
        <Input placeholder="Tìm kiếm kỷ niệm..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
        <Chip active={!selectedTag} onClick={() => setSelectedTag(null)}>Tất cả</Chip>
        {MEMORY_TAGS.map((tag) => (
          <Chip key={tag} active={selectedTag === tag} onClick={() => setSelectedTag(tag)}>{tag}</Chip>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4"><Skeleton className="h-48 w-full" /><Skeleton className="h-32 w-full" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Heart className="h-12 w-12" />} title="Không tìm thấy kỷ niệm nào" description={search || selectedTag ? "Hãy thử từ khóa hoặc bộ lọc khác." : "Bắt đầu tạo kỷ niệm đẹp đầu tiên cùng nhau!"} action={!(search || selectedTag) ? <Button onClick={openCreate}>Thêm kỷ niệm</Button> : null} />
      ) : (
        <div className="space-y-4">
          {filtered.map((memory) => (
            <Card key={memory.id} className="overflow-hidden p-0 relative group">
              <Link href={`/memories/${memory.id}`} className="block active:scale-[0.99] transition">
                {memory.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={memory.coverImageUrl} alt={memory.title} className="h-40 w-full object-cover border-b" loading="lazy" />
                ) : null}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(memory.happenedAt)}</span>
                        <span>•</span>
                        <span>Bởi {memory.createdBy?.name || "Bạn"}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary font-semibold">
                          <Images className="h-3 w-3" /> {memory.gallery?.length || 0} ảnh
                        </span>
                      </div>
                      <h3 className="mt-1 text-base font-bold text-foreground">{memory.title}</h3>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">{memory.description}</p>
                  {memory.tags.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {memory.tags.map((t) => (
                        <span key={t} className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          <Tag className="h-2.5 w-2.5" /> {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Link>
              <div className="absolute right-4 top-4 flex gap-1">
                <Button variant="secondary" size="sm" className="h-8 px-3" onClick={() => openEdit(memory)}>Sửa</Button>
                <button type="button" onClick={() => handleDelete(memory.id)} className="flex h-8 w-8 items-center justify-center rounded-xl bg-card/80 text-destructive hover:bg-destructive/8 active:scale-95 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <BottomSheet isOpen={formOpen} onClose={() => setFormOpen(false)} title={editingMemory ? "Sửa kỷ niệm" : "Tạo kỷ niệm mới"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Ảnh bìa kỷ niệm</label>
            <div className="flex items-center gap-4">
              {coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverImageUrl} alt="Bìa" className="h-16 w-24 rounded-xl object-cover border" />
              ) : (
                <div className="flex h-16 w-24 items-center justify-center rounded-xl bg-muted text-xs text-muted-foreground border">Không có ảnh</div>
              )}
              <div className="relative">
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="absolute inset-0 w-full opacity-0 cursor-pointer" disabled={uploading} />
                <Button type="button" variant="secondary" size="sm" loading={uploading}>Chọn ảnh bìa</Button>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Ảnh trong album</label>
            <input type="file" accept="image/*" multiple onChange={(e) => setAlbumFiles(Array.from(e.target.files || []))} className="block w-full rounded-2xl border border-input bg-muted/20 px-4 py-3 text-sm" />
            <p className="mt-1 text-xs text-muted-foreground">
              {albumFiles.length > 0 ? `Đã chọn ${albumFiles.length} ảnh mới để thêm vào album.` : editingMemory ? "Chọn thêm ảnh mới cho album này." : "Chọn nhiều ảnh để tạo album cho kỷ niệm này."}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Tiêu đề</label>
            <Input placeholder="Hôm nay tụi mình làm gì..." value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Ngày kỷ niệm</label>
            <Input type="date" value={happenedAt} onChange={(e) => setHappenedAt(e.target.value)} required />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Mô tả câu chuyện</label>
            <Textarea placeholder="Chia sẻ cảm xúc hoặc câu chuyện thú vị..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Tags</label>
            <div className="flex flex-wrap gap-2">
              {MEMORY_TAGS.map((tag) => <Chip key={tag} active={tags.includes(tag)} onClick={() => toggleTag(tag)}>{tag}</Chip>)}
            </div>
          </div>

          <Button type="submit" loading={saving} className="w-full">
            {editingMemory ? "Lưu thay đổi" : "Tạo kỷ niệm"}
          </Button>
        </form>
      </BottomSheet>
    </ScreenContainer>
  );
}
