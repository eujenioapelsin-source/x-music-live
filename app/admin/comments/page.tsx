"use client";
import { useEffect, useState } from "react";
import { AdminLayout } from "../_components/admin-dashboard-client";
import { MessageSquare, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [tab, setTab] = useState("pending");
  const [pendingCount, setPendingCount] = useState(0);
  const load = () => { fetch(`/api/admin/comments?status=${tab}`).then((r: any) => r?.json?.()).then((d: any) => { setComments(d?.comments ?? []); setPendingCount(d?.pendingCount ?? 0); }).catch(() => {}); };
  useEffect(() => { load(); }, [tab]);

  const approve = async (id: string) => { await fetch(`/api/admin/comments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ approved: true }) }); toast.success("Approved"); load(); };
  const remove = async (id: string) => { if (!confirm("Delete?")) return; await fetch(`/api/admin/comments/${id}`, { method: "DELETE" }); toast.success("Deleted"); load(); };

  return (
    <AdminLayout title="Comments">
      <div className="flex gap-2 mb-6">{["pending", "approved", "all"].map((t: string) => (<button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{t === "pending" ? `Pending (${pendingCount})` : t.charAt(0).toUpperCase() + t.slice(1)}</button>))}</div>
      <div className="space-y-3">{(comments ?? []).map((c: any) => (<div key={c?.id} className="bg-card rounded-lg p-4 flex items-start justify-between gap-4" style={{ boxShadow: "var(--shadow-sm)" }}><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><span className="font-medium text-sm">{c?.name ?? ""}</span>{c?.email && <span className="text-xs text-muted-foreground">{c.email}</span>}<span className="text-xs text-muted-foreground">{c?.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}</span></div><p className="text-sm text-muted-foreground">{c?.message ?? ""}</p>{c?.ipAddress && <p className="text-xs text-muted-foreground mt-1">IP: {c.ipAddress}</p>}</div><div className="flex gap-1 flex-shrink-0">{!c?.approved && <button onClick={() => approve(c?.id)} className="p-2 rounded-lg hover:bg-green-500/10 text-green-500"><Check className="h-4 w-4" /></button>}<button onClick={() => remove(c?.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button></div></div>))}{(comments?.length ?? 0) === 0 && <div className="p-8 text-center text-muted-foreground">No comments.</div>}</div>
    </AdminLayout>
  );
}
