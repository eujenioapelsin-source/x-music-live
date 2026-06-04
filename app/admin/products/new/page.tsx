"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "../../_components/admin-dashboard-client";
import { toast } from "sonner";

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<any>({ type: "track", title: "", description: "", genre: "", style: "", price: 0, currency: "USD", artworkUrl: "", audioPreviewUrl: "", downloadUrl: "", lyrics: "", story: "", releaseDate: "", published: false, featured: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form?.title?.trim()) { toast.error("Title required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res?.json?.().catch(() => ({}));
      if (res?.ok) { toast.success("Product created!"); router.push("/admin/products"); } else toast.error(data?.error ?? "Failed");
    } catch { toast.error("Failed"); } finally { setLoading(false); }
  };

  const update = (key: string, value: any) => setForm((p: any) => ({ ...(p ?? {}), [key]: value }));

  return (
    <AdminLayout title="New Product">
      <form onSubmit={handleSubmit} className="max-w-[700px] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="text-xs text-muted-foreground">Type</label><select value={form?.type ?? "track"} onChange={(e: any) => update("type", e?.target?.value)} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm mt-1"><option value="track">Track</option><option value="album">Album</option><option value="dj-mix">DJ Mix</option><option value="live-set">Live Set</option></select></div>
          <div><label className="text-xs text-muted-foreground">Title</label><input type="text" value={form?.title ?? ""} onChange={(e: any) => update("title", e?.target?.value)} required className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm mt-1" /></div>
        </div>
        <div><label className="text-xs text-muted-foreground">Description</label><textarea value={form?.description ?? ""} onChange={(e: any) => update("description", e?.target?.value)} rows={3} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm mt-1 resize-none" /></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className="text-xs text-muted-foreground">Genre</label><input type="text" value={form?.genre ?? ""} onChange={(e: any) => update("genre", e?.target?.value)} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm mt-1" /></div>
          <div><label className="text-xs text-muted-foreground">Style</label><input type="text" value={form?.style ?? ""} onChange={(e: any) => update("style", e?.target?.value)} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm mt-1" /></div>
          <div><label className="text-xs text-muted-foreground">Price</label><input type="number" step="0.01" value={form?.price ?? 0} onChange={(e: any) => update("price", parseFloat(e?.target?.value) || 0)} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm mt-1" /></div>
        </div>
        <div><label className="text-xs text-muted-foreground">Artwork URL</label><input type="text" value={form?.artworkUrl ?? ""} onChange={(e: any) => update("artworkUrl", e?.target?.value)} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm mt-1" placeholder="https://i.ytimg.com/vi/FSUWvt7FKbI/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAuyNxEmoNBC4NOzgziEpFcsV-WoA" /></div>
        <div><label className="text-xs text-muted-foreground">Audio Preview URL</label><input type="text" value={form?.audioPreviewUrl ?? ""} onChange={(e: any) => update("audioPreviewUrl", e?.target?.value)} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm mt-1" /></div>
        <div><label className="text-xs text-muted-foreground">Download URL</label><input type="text" value={form?.downloadUrl ?? ""} onChange={(e: any) => update("downloadUrl", e?.target?.value)} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm mt-1" /></div>
        <div><label className="text-xs text-muted-foreground">Story</label><textarea value={form?.story ?? ""} onChange={(e: any) => update("story", e?.target?.value)} rows={3} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm mt-1 resize-none" /></div>
        <div><label className="text-xs text-muted-foreground">Release Date</label><input type="date" value={form?.releaseDate ?? ""} onChange={(e: any) => update("releaseDate", e?.target?.value)} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm mt-1" /></div>
        <div className="flex gap-6"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form?.published ?? false} onChange={(e: any) => update("published", e?.target?.checked)} className="rounded" /> Published</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form?.featured ?? false} onChange={(e: any) => update("featured", e?.target?.checked)} className="rounded" /> Featured</label></div>
        <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50">{loading ? "Creating..." : "Create Product"}</button>
      </form>
    </AdminLayout>
  );
}
