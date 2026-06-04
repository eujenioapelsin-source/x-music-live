"use client";
import { useEffect, useState } from "react";
import { AdminLayout } from "../_components/admin-dashboard-client";
import { Users, Download, Trash2, Search, Send } from "lucide-react";
import { toast } from "sonner";

export default function AdminSubscribersPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [nlSubject, setNlSubject] = useState("");
  const [nlBody, setNlBody] = useState("");
  const [nlSending, setNlSending] = useState(false);
  const load = () => { const p = new URLSearchParams(); if (search) p.set("search", search); fetch(`/api/admin/subscribers?${p}`).then((r: any) => r?.json?.()).then((d: any) => setSubs(d ?? [])).catch(() => {}); };
  useEffect(() => { load(); }, [search]);
  const remove = async (id: string) => { if (!confirm("Remove?")) return; await fetch(`/api/admin/subscribers?id=${id}`, { method: "DELETE" }); toast.success("Removed"); load(); };
  const sendNewsletter = async () => { if (!nlSubject || !nlBody) { toast.error("Subject and body required"); return; } setNlSending(true); try { const res = await fetch("/api/admin/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject: nlSubject, htmlBody: nlBody }) }); const d = await res?.json?.().catch(() => ({})); toast.success(`Sent to ${d?.sent ?? 0} subscribers`); setShowNewsletter(false); } catch { toast.error("Failed"); } finally { setNlSending(false); } };

  return (
    <AdminLayout title="Subscribers">
      <div className="flex flex-wrap gap-3 mb-6"><div className="relative flex-1 max-w-[250px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" value={search} onChange={(e: any) => setSearch(e?.target?.value ?? "")} placeholder="Search..." className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-sm" /></div><a href="/api/admin/subscribers/export" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80"><Download className="h-4 w-4" /> Export</a><button onClick={() => setShowNewsletter(!showNewsletter)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"><Send className="h-4 w-4" /> Newsletter</button></div>
      {showNewsletter && (<div className="bg-card rounded-lg p-6 mb-6" style={{ boxShadow: "var(--shadow-md)" }}><h3 className="font-semibold mb-4">Send Newsletter</h3><input type="text" value={nlSubject} onChange={(e: any) => setNlSubject(e?.target?.value ?? "")} placeholder="Subject" className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm mb-3" /><textarea value={nlBody} onChange={(e: any) => setNlBody(e?.target?.value ?? "")} placeholder="HTML body content" rows={5} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm mb-3 resize-none" /><button onClick={sendNewsletter} disabled={nlSending} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">{nlSending ? "Sending..." : "Send to All Confirmed"}</button></div>)}
      <div className="bg-card rounded-lg overflow-x-auto" style={{ boxShadow: "var(--shadow-sm)" }}><table className="w-full text-sm"><thead><tr className="border-b border-border bg-secondary/50"><th className="text-left p-3 font-medium text-muted-foreground">Email</th><th className="text-left p-3 font-medium text-muted-foreground">Confirmed</th><th className="text-left p-3 font-medium text-muted-foreground">Date</th><th className="text-right p-3 font-medium text-muted-foreground">Actions</th></tr></thead><tbody>{(subs ?? []).map((s: any) => (<tr key={s?.id} className="border-b border-border last:border-0"><td className="p-3">{s?.email ?? ""}</td><td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${s?.confirmed ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>{s?.confirmed ? "Yes" : "No"}</span></td><td className="p-3 text-muted-foreground">{s?.createdAt ? new Date(s.createdAt).toLocaleDateString() : ""}</td><td className="p-3 text-right"><button onClick={() => remove(s?.id)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button></td></tr>))}</tbody></table>{(subs?.length ?? 0) === 0 && <div className="p-8 text-center text-muted-foreground">No subscribers.</div>}</div>
    </AdminLayout>
  );
}
