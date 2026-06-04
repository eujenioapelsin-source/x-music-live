"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export function CommunityClient() {
  const [comments, setComments] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const loadComments = (p: number) => {
    fetch(`/api/comments?page=${p}`).then((r: any) => r?.json?.()).then((d: any) => { setComments(d?.comments ?? []); setPages(d?.pages ?? 1); setPage(d?.page ?? 1); }).catch(() => {});
  };
  useEffect(() => { loadComments(1); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/comments/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res?.json?.().catch(() => ({}));
      if (res?.ok) { toast.success(data?.message ?? "Submitted!"); setForm({ name: "", email: "", message: "" }); } else toast.error(data?.error ?? "Failed");
    } catch { toast.error("Failed"); } finally { setSending(false); }
  };

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8 text-center"><MessageSquare className="h-8 w-8 text-primary mx-auto mb-3" /><h1 className="font-display text-3xl font-bold tracking-tight">Guestbook</h1><p className="text-muted-foreground mt-1">Leave a message, share your thoughts.</p></div>

      <form onSubmit={handleSubmit} className="bg-card rounded-lg p-6 mb-8" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <input type="text" value={form?.name ?? ""} onChange={(e: any) => setForm((p: any) => ({ ...(p ?? {}), name: e?.target?.value ?? "" }))} placeholder="Name *" required className="h-11 px-4 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="email" value={form?.email ?? ""} onChange={(e: any) => setForm((p: any) => ({ ...(p ?? {}), email: e?.target?.value ?? "" }))} placeholder="Email (optional)" className="h-11 px-4 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <textarea value={form?.message ?? ""} onChange={(e: any) => setForm((p: any) => ({ ...(p ?? {}), message: e?.target?.value ?? "" }))} placeholder="Your message * (max 500 chars)" required maxLength={500} rows={3} className="w-full px-4 py-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none mb-4" />
        <button type="submit" disabled={sending} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"><Send className="h-4 w-4" />{sending ? "Sending..." : "Post Message"}</button>
      </form>

      <div className="space-y-4">
        {(comments ?? []).map((c: any, i: number) => (
          <motion.div key={c?.id ?? i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-lg p-4" style={{ boxShadow: "var(--shadow-sm)" }}>
            <div className="flex items-center justify-between mb-2"><span className="font-medium text-sm">{c?.name ?? "Anonymous"}</span><span className="text-xs text-muted-foreground">{c?.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}</span></div>
            <p className="text-sm text-muted-foreground">{c?.message ?? ""}</p>
          </motion.div>
        ))}
        {(comments?.length ?? 0) === 0 && <div className="text-center py-12"><MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No messages yet. Be the first!</p></div>}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={() => loadComments(page - 1)} disabled={page <= 1} className="p-2 rounded-lg bg-secondary disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
          <span className="text-sm text-muted-foreground">Page {page} of {pages}</span>
          <button onClick={() => loadComments(page + 1)} disabled={page >= pages} className="p-2 rounded-lg bg-secondary disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  );
}
