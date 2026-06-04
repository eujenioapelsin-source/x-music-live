"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Play, Search, Filter } from "lucide-react";

const TYPES = ["all", "track", "album", "dj-mix", "live-set"];
const TL: Record<string, string> = { all: "All", track: "Tracks", album: "Albums", "dj-mix": "DJ Mixes", "live-set": "Live Sets" };

export function StoreClient() {
  const [products, setProducts] = useState<any[]>([]);
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    if (search) params.set("search", search);
    fetch(`/api/products?${params}`).then((r: any) => r?.json?.()).then((d: any) => setProducts(d ?? [])).catch(() => {}).finally(() => setLoading(false));
  }, [type, search]);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8"><ShoppingBag className="h-8 w-8 text-primary mb-3" /><h1 className="font-display text-3xl font-bold tracking-tight">Music Store</h1><p className="text-muted-foreground mt-1">Browse and purchase tracks, albums, DJ mixes, and live sets.</p></div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8"><div className="flex flex-wrap gap-2">{TYPES.map((t: string) => (<button key={t} onClick={() => setType(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${type === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{TL?.[t] ?? t}</button>))}</div><div className="relative flex-1 max-w-[300px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" value={search} onChange={(e: any) => setSearch(e?.target?.value ?? "")} placeholder="Search..." className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary" /></div></div>
      {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{[1,2,3,4].map((i: number) => <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />)}</div>
      : (products?.length ?? 0) === 0 ? <div className="text-center py-20"><Filter className="h-10 w-10 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No products found.</p></div>
      : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{(products ?? []).map((p: any, i: number) => (<motion.div key={p?.id ?? i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}><Link href={`/music/${p?.slug ?? p?.id}`} className="block group"><div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3">{p?.artworkUrl && <Image src={p.artworkUrl} alt={p?.title ?? ""} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />}<div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center"><Play className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" /></div><div className="absolute top-2 right-2 px-2 py-1 rounded bg-background/80 backdrop-blur-sm text-xs font-medium">{TL?.[p?.type] ?? p?.type}</div></div><h3 className="font-medium text-sm truncate">{p?.title ?? "Untitled"}</h3><div className="flex items-center justify-between mt-1"><span className="text-xs text-muted-foreground">{p?.genre ?? ""}</span><span className="text-sm font-semibold text-primary">${p?.price?.toFixed?.(2) ?? "0.00"}</span></div></Link></motion.div>))}</div>}
    </div>
  );
}
