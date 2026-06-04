"use client";
import { useEffect, useState } from "react";
import { AdminLayout } from "../_components/admin-dashboard-client";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2, Search, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const load = () => { const p = new URLSearchParams(); if (typeFilter) p.set("type", typeFilter); if (search) p.set("search", search); fetch(`/api/admin/products?${p}`).then((r: any) => r?.json?.()).then((d: any) => setProducts(d ?? [])).catch(() => {}); };
  useEffect(() => { load(); }, [typeFilter, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    toast.success("Deleted"); load();
  };
  const togglePublished = async (id: string, published: boolean) => {
    await fetch(`/api/admin/products/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !published }) });
    toast.success(published ? "Unpublished" : "Published"); load();
  };

  return (
    <AdminLayout title="Products">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Link href="/admin/products/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"><Plus className="h-4 w-4" /> New Product</Link>
        <div className="relative flex-1 max-w-[250px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" value={search} onChange={(e: any) => setSearch(e?.target?.value ?? "")} placeholder="Search..." className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary" /></div>
        <select value={typeFilter} onChange={(e: any) => setTypeFilter(e?.target?.value ?? "")} className="h-10 px-3 rounded-lg bg-secondary border border-border text-sm"><option value="">All Types</option><option value="track">Tracks</option><option value="album">Albums</option><option value="dj-mix">DJ Mixes</option><option value="live-set">Live Sets</option></select>
      </div>
      <div className="bg-card rounded-lg overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border bg-secondary/50"><th className="text-left p-3 font-medium text-muted-foreground">Product</th><th className="text-left p-3 font-medium text-muted-foreground">Type</th><th className="text-left p-3 font-medium text-muted-foreground">Price</th><th className="text-left p-3 font-medium text-muted-foreground">Plays</th><th className="text-left p-3 font-medium text-muted-foreground">Sales</th><th className="text-left p-3 font-medium text-muted-foreground">Status</th><th className="text-right p-3 font-medium text-muted-foreground">Actions</th></tr></thead><tbody>{(products ?? []).map((p: any) => (<tr key={p?.id} className="border-b border-border last:border-0 hover:bg-secondary/30"><td className="p-3"><div className="flex items-center gap-3">{p?.artworkUrl && <div className="relative w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0"><Image src={p.artworkUrl} alt="" fill className="object-cover" /></div>}<span className="font-medium">{p?.title ?? ""}</span></div></td><td className="p-3 text-muted-foreground capitalize">{p?.type?.replace?.("-", " ") ?? ""}</td><td className="p-3">${p?.price?.toFixed?.(2) ?? "0.00"}</td><td className="p-3 text-muted-foreground">{p?.playCount ?? 0}</td><td className="p-3 text-muted-foreground">{p?.purchaseCount ?? 0}</td><td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${p?.published ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>{p?.published ? "Published" : "Draft"}</span></td><td className="p-3"><div className="flex items-center justify-end gap-1"><button onClick={() => togglePublished(p?.id, p?.published)} className="p-1.5 rounded hover:bg-secondary" title={p?.published ? "Unpublish" : "Publish"}>{p?.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button><Link href={`/admin/products/${p?.id}/edit`} className="p-1.5 rounded hover:bg-secondary"><Edit className="h-4 w-4" /></Link><button onClick={() => handleDelete(p?.id)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button></div></td></tr>))}</tbody></table></div>
        {(products?.length ?? 0) === 0 && <div className="p-8 text-center text-muted-foreground">No products found.</div>}
      </div>
    </AdminLayout>
  );
}
