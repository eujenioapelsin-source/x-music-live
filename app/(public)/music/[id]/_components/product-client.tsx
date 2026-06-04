"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Pause, ShoppingCart, Clock, Music, BookOpen, ListMusic } from "lucide-react";
import { toast } from "sonner";

export function ProductClient({ id }: { id: string }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch(`/api/products/${id}`).then((r: any) => r?.json?.()).then((d: any) => { setProduct(d); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const togglePlay = () => {
    if (!audioRef?.current) return;
    if (playing) { audioRef.current.pause(); } else {
      audioRef.current.play().catch(() => {});
      fetch(`/api/products/${product?.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ incrementPlay: true }) }).catch(() => {});
    }
    setPlaying(!playing);
  };

  const handleBuy = async () => {
    try {
      const res = await fetch("/api/paypal/create-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product?.id, type: "product" }) });
      const data = await res?.json?.().catch(() => ({}));
      if (data?.approveUrl) { window.open(data.approveUrl, "_blank"); }
      else if (data?.orderId) { toast.info("Please configure PayPal credentials to enable purchases."); }
      else { toast.error(data?.error ?? "Failed to create order"); }
    } catch { toast.error("Failed"); }
  };

  if (loading) return <div className="max-w-[1200px] mx-auto px-4 py-20 text-center"><div className="animate-pulse"><div className="w-64 h-64 bg-muted rounded-lg mx-auto mb-4" /><div className="h-8 w-48 bg-muted rounded mx-auto" /></div></div>;
  if (!product) return <div className="max-w-[1200px] mx-auto px-4 py-20 text-center"><Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h2 className="text-xl font-bold">Product not found</h2></div>;

  const TL: Record<string, string> = { track: "Track", album: "Album", "dj-mix": "DJ Mix", "live-set": "Live Set" };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          {product?.artworkUrl && <Image src={product.artworkUrl} alt={product?.title ?? ""} fill className="object-cover" priority />}
        </div>
        <div>
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">{TL?.[product?.type] ?? product?.type}</div>
          <h1 className="font-display text-3xl font-bold tracking-tight mb-2">{product?.title ?? "Untitled"}</h1>
          <p className="text-muted-foreground mb-4">{product?.genre ?? ""}{product?.style ? ` · ${product.style}` : ""}</p>
          {product?.description && <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{product.description}</p>}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-primary">${product?.price?.toFixed?.(2) ?? "0.00"}</span>
            <span className="text-sm text-muted-foreground"><Play className="inline h-3 w-3" /> {product?.playCount ?? 0} plays</span>
          </div>
          {product?.audioPreviewUrl && <audio ref={audioRef} src={product.audioPreviewUrl} onEnded={() => setPlaying(false)} />}
          <div className="flex flex-wrap gap-3 mb-8">
            {product?.audioPreviewUrl && <button onClick={togglePlay} className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors">{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{playing ? "Pause" : "Preview"}</button>}
            <button onClick={handleBuy} className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"><ShoppingCart className="h-4 w-4" /> Buy Now</button>
          </div>
          {product?.releaseDate && <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Released: {new Date(product.releaseDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>}
        </div>
      </motion.div>

      {(product?.tracks?.length ?? 0) > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12">
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2"><ListMusic className="h-5 w-5 text-primary" /> Track Listing</h2>
          <div className="bg-card rounded-lg overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
            {(product?.tracks ?? []).map((t: any, i: number) => (
              <div key={t?.id ?? i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                <span className="text-sm text-muted-foreground w-8 text-right">{t?.trackNumber ?? i + 1}</span>
                <span className="flex-1 text-sm font-medium">{t?.title ?? "Untitled"}</span>
                <span className="text-sm text-muted-foreground">{t?.duration ?? ""}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {product?.story && (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 max-w-[700px]">
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Story Behind the Music</h2>
          <p className="text-muted-foreground leading-relaxed">{product.story}</p>
        </motion.div>
      )}

      {product?.lyrics && (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 max-w-[700px]">
          <h2 className="font-display text-xl font-bold mb-4">Lyrics</h2>
          <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">{product.lyrics}</pre>
        </motion.div>
      )}
    </div>
  );
}
