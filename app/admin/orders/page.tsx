"use client";
import { useEffect, useState } from "react";
import { AdminLayout } from "../_components/admin-dashboard-client";
import { ShoppingCart, Download, Search } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  useEffect(() => { const p = new URLSearchParams(); if (search) p.set("search", search); fetch(`/api/admin/orders?${p}`).then((r: any) => r?.json?.()).then((d: any) => setOrders(d ?? [])).catch(() => {}); }, [search]);

  return (
    <AdminLayout title="Orders">
      <div className="flex gap-3 mb-6"><div className="relative flex-1 max-w-[300px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" value={search} onChange={(e: any) => setSearch(e?.target?.value ?? "")} placeholder="Search orders..." className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-sm" /></div><a href="/api/admin/orders/export" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80"><Download className="h-4 w-4" /> Export CSV</a></div>
      <div className="bg-card rounded-lg overflow-x-auto" style={{ boxShadow: "var(--shadow-sm)" }}><table className="w-full text-sm"><thead><tr className="border-b border-border bg-secondary/50"><th className="text-left p-3 font-medium text-muted-foreground">Product</th><th className="text-left p-3 font-medium text-muted-foreground">Buyer</th><th className="text-left p-3 font-medium text-muted-foreground">Amount</th><th className="text-left p-3 font-medium text-muted-foreground">Type</th><th className="text-left p-3 font-medium text-muted-foreground">Status</th><th className="text-left p-3 font-medium text-muted-foreground">Date</th></tr></thead><tbody>{(orders ?? []).map((o: any) => (<tr key={o?.id} className="border-b border-border last:border-0"><td className="p-3">{o?.product?.title ?? "License/Other"}</td><td className="p-3 text-muted-foreground">{o?.buyerEmail ?? ""}</td><td className="p-3">${o?.amount?.toFixed?.(2) ?? "0.00"}</td><td className="p-3 capitalize text-muted-foreground">{o?.type ?? ""}</td><td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${o?.status === "completed" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>{o?.status ?? ""}</span></td><td className="p-3 text-muted-foreground">{o?.createdAt ? new Date(o.createdAt).toLocaleDateString() : ""}</td></tr>))}</tbody></table>{(orders?.length ?? 0) === 0 && <div className="p-8 text-center text-muted-foreground">No orders yet.</div>}</div>
    </AdminLayout>
  );
}
