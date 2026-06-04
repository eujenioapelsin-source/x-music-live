"use client";
import { useEffect, useState } from "react";
import { AdminLayout } from "../_components/admin-dashboard-client";
import { Heart, Download, Search } from "lucide-react";

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  useEffect(() => { const p = new URLSearchParams(); if (typeFilter) p.set("type", typeFilter); if (search) p.set("search", search); fetch(`/api/admin/donations?${p}`).then((r: any) => r?.json?.()).then((d: any) => setDonations(d ?? [])).catch(() => {}); }, [search, typeFilter]);

  return (
    <AdminLayout title="Donations">
      <div className="flex gap-3 mb-6"><div className="relative flex-1 max-w-[250px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" value={search} onChange={(e: any) => setSearch(e?.target?.value ?? "")} placeholder="Search..." className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-sm" /></div><select value={typeFilter} onChange={(e: any) => setTypeFilter(e?.target?.value ?? "")} className="h-10 px-3 rounded-lg bg-secondary border border-border text-sm"><option value="">All</option><option value="one-time">One-Time</option><option value="monthly">Monthly</option></select><a href="/api/admin/donations/export" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80"><Download className="h-4 w-4" /> Export</a></div>
      <div className="bg-card rounded-lg overflow-x-auto" style={{ boxShadow: "var(--shadow-sm)" }}><table className="w-full text-sm"><thead><tr className="border-b border-border bg-secondary/50"><th className="text-left p-3 font-medium text-muted-foreground">Nickname</th><th className="text-left p-3 font-medium text-muted-foreground">Amount</th><th className="text-left p-3 font-medium text-muted-foreground">Type</th><th className="text-left p-3 font-medium text-muted-foreground">Status</th><th className="text-left p-3 font-medium text-muted-foreground">Date</th></tr></thead><tbody>{(donations ?? []).map((d: any) => (<tr key={d?.id} className="border-b border-border last:border-0"><td className="p-3 font-medium">{d?.donorNickname ?? "Anonymous"}</td><td className="p-3">€{d?.amount?.toFixed?.(2) ?? "0.00"}</td><td className="p-3 capitalize text-muted-foreground">{d?.type ?? ""}</td><td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${d?.status === "completed" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>{d?.status ?? ""}</span></td><td className="p-3 text-muted-foreground">{d?.createdAt ? new Date(d.createdAt).toLocaleDateString() : ""}</td></tr>))}</tbody></table>{(donations?.length ?? 0) === 0 && <div className="p-8 text-center text-muted-foreground">No donations yet.</div>}</div>
    </AdminLayout>
  );
}
