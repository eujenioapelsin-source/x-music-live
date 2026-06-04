"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminLayout } from "../../../_components/admin-dashboard-client";
import { toast } from "sonner";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { fetch(`/api/admin/events`).then((r: any) => r?.json?.()).then((events: any[]) => { const e = (events ?? []).find((ev: any) => ev?.id === id); if (e) setForm({ ...e, date: e?.date ? new Date(e.date).toISOString().split("T")[0] : "" }); }).catch(() => {}); }, [id]);
  const update = (k: string, v: any) => setForm((p: any) => ({ ...(p ?? {}), [k]: v }));
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); try { const res = await fetch(`/api/admin/events/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); if (res?.ok) { toast.success("Updated!"); router.push("/admin/events"); } else toast.error("Failed"); } catch { toast.error("Failed"); } finally { setLoading(false); } };
  if (!form) return <AdminLayout title="Edit Event"><div className="animate-pulse h-40 bg-muted rounded-lg" /></AdminLayout>;
  return (
    <AdminLayout title={`Edit: ${form?.title ?? ""}`}>
      <form onSubmit={handleSubmit} className="max-w-[500px] space-y-4">
        <div><label className="text-xs text-muted-foreground">Title</label><input type="text" value={form?.title ?? ""} onChange={(e: any) => update("title", e?.target?.value)} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm mt-1" /></div>
        <div><label className="text-xs text-muted-foreground">Description</label><textarea value={form?.description ?? ""} onChange={(e: any) => update("description", e?.target?.value)} rows={3} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm mt-1 resize-none" /></div>
        <div><label className="text-xs text-muted-foreground">Date</label><input type="date" value={form?.date ?? ""} onChange={(e: any) => update("date", e?.target?.value)} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm mt-1" /></div>
        <div><label className="text-xs text-muted-foreground">External Link</label><input type="text" value={form?.externalLink ?? ""} onChange={(e: any) => update("externalLink", e?.target?.value)} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm mt-1" /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form?.published ?? false} onChange={(e: any) => update("published", e?.target?.checked)} /> Published</label>
        <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50">{loading ? "Saving..." : "Save"}</button>
      </form>
    </AdminLayout>
  );
}
