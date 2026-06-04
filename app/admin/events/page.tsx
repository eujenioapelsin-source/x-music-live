"use client";
import { useEffect, useState } from "react";
import { AdminLayout } from "../_components/admin-dashboard-client";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const load = () => { fetch("/api/admin/events").then((r: any) => r?.json?.()).then((d: any) => setEvents(d ?? [])).catch(() => {}); };
  useEffect(() => { load(); }, []);
  const remove = async (id: string) => { if (!confirm("Delete?")) return; await fetch(`/api/admin/events/${id}`, { method: "DELETE" }); toast.success("Deleted"); load(); };

  return (
    <AdminLayout title="Events">
      <Link href="/admin/events/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 mb-6"><Plus className="h-4 w-4" /> New Event</Link>
      <div className="bg-card rounded-lg overflow-x-auto" style={{ boxShadow: "var(--shadow-sm)" }}><table className="w-full text-sm"><thead><tr className="border-b border-border bg-secondary/50"><th className="text-left p-3 font-medium text-muted-foreground">Title</th><th className="text-left p-3 font-medium text-muted-foreground">Date</th><th className="text-left p-3 font-medium text-muted-foreground">Published</th><th className="text-right p-3 font-medium text-muted-foreground">Actions</th></tr></thead><tbody>{(events ?? []).map((e: any) => (<tr key={e?.id} className="border-b border-border last:border-0"><td className="p-3 font-medium">{e?.title ?? ""}</td><td className="p-3 text-muted-foreground">{e?.date ? new Date(e.date).toLocaleDateString() : ""}</td><td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${e?.published ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>{e?.published ? "Yes" : "No"}</span></td><td className="p-3 text-right"><div className="flex justify-end gap-1"><Link href={`/admin/events/${e?.id}/edit`} className="p-1.5 rounded hover:bg-secondary"><Edit className="h-4 w-4" /></Link><button onClick={() => remove(e?.id)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button></div></td></tr>))}</tbody></table>{(events?.length ?? 0) === 0 && <div className="p-8 text-center text-muted-foreground">No events.</div>}</div>
    </AdminLayout>
  );
}
