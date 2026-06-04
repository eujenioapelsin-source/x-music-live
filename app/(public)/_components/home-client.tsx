"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Play, ShoppingBag, Heart, Music, Calendar, Trophy, ArrowRight, Send } from "lucide-react";
import { toast } from "sonner";

function AnimatedCounter({ target, suffix }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.max(1, Math.floor(target / 40));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); } else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count?.toLocaleString?.() ?? "0"}{suffix ?? ""}</span>;
}

export function HomeClient() {
  const [products, setProducts] = useState<any[]>([]);
  const [donators, setDonators] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/products?featured=true").then((r: any) => r?.json?.()).then((d: any) => setProducts(d ?? [])).catch(() => {});
    fetch("/api/donations").then((r: any) => r?.json?.()).then((d: any) => setDonators(d?.topDonators ?? [])).catch(() => {});
    fetch("/api/settings?keys=home_hero_heading,home_hero_subheading,home_about_heading,home_about_text").then((r: any) => r?.json?.()).then((d: any) => setSettings(d ?? {})).catch(() => {});
  }, []);

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/comments/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: contactForm?.name, email: contactForm?.email, message: contactForm?.message }) });
      const data = await res?.json?.().catch(() => ({}));
      if (res?.ok) { toast.success(data?.message ?? "Sent!"); setContactForm({ name: "", email: "", message: "" }); } else toast.error(data?.error ?? "Failed");
    } catch { toast.error("Failed"); } finally { setSending(false); }
  };

  return (
    <div>
      <section className="relative min-h-[85vh] flex items-center justify-center hero-gradient overflow-hidden">
        <div className="absolute inset-0 z-0"><Image src="https://cdn.abacus.ai/images/cd56fc57-e0f9-4936-9aae-a8564635dcc6.png" alt="X Music hero" fill className="object-cover opacity-30" priority /><div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" /></div>
        <div className="relative z-10 max-w-[800px] mx-auto text-center px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Music className="h-12 w-12 text-primary mx-auto mb-6" />
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-4">{settings?.home_hero_heading ?? "Welcome to X Music"}</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-[600px] mx-auto">{settings?.home_hero_subheading ?? "Electronic music crafted with passion."}</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/store" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"><ShoppingBag className="h-4 w-4" /> Explore Music</Link>
              <Link href="/support" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors"><Heart className="h-4 w-4" /> Support</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-secondary/20"><div className="max-w-[1200px] mx-auto px-4 sm:px-6"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-[700px] mx-auto text-center"><h2 className="font-display text-3xl font-bold tracking-tight mb-4">{settings?.home_about_heading ?? "The Artist"}</h2><p className="text-muted-foreground leading-relaxed">{settings?.home_about_text ?? "X is an electronic music producer and DJ."}</p></motion.div></div></section>

      <section className="py-20"><div className="max-w-[1200px] mx-auto px-4 sm:px-6"><div className="flex items-center justify-between mb-8"><h2 className="font-display text-2xl font-bold tracking-tight">Featured Music</h2><Link href="/store" className="text-sm text-primary hover:underline flex items-center gap-1">View All <ArrowRight className="h-3 w-3" /></Link></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{(products ?? []).slice(0, 4).map((p: any, i: number) => (<motion.div key={p?.id ?? i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}><Link href={`/music/${p?.slug ?? p?.id}`} className="block group"><div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3">{p?.artworkUrl && <Image src={p.artworkUrl} alt={p?.title ?? "Track"} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />}<div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center"><Play className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" /></div></div><h3 className="font-medium text-sm truncate">{p?.title ?? "Untitled"}</h3><p className="text-xs text-muted-foreground">{p?.genre ?? ""} · ${p?.price?.toFixed?.(2) ?? "0.00"}</p></Link></motion.div>))}</div></div></section>

      <section className="py-16 bg-secondary/20"><div className="max-w-[1200px] mx-auto px-4 sm:px-6"><div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">{[{ icon: Music, label: "Tracks", val: products?.length ?? 0 }, { icon: Play, label: "Total Plays", val: (products ?? []).reduce((a: number, p: any) => a + (p?.playCount ?? 0), 0) }, { icon: Heart, label: "Supporters", val: donators?.length ?? 0 }, { icon: Calendar, label: "Years Active", val: 5 }].map((s: any, i: number) => (<motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center"><s.icon className="h-6 w-6 text-primary mb-2" /><div className="font-display text-2xl font-bold"><AnimatedCounter target={s?.val ?? 0} /></div><div className="text-xs text-muted-foreground">{s?.label ?? ""}</div></motion.div>))}</div></div></section>

      {(donators?.length ?? 0) > 0 && (<section className="py-16"><div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center"><Trophy className="h-8 w-8 text-primary mx-auto mb-4" /><h2 className="font-display text-2xl font-bold tracking-tight mb-8">Top Supporters</h2><div className="flex flex-wrap justify-center gap-6">{(donators ?? []).map((d: any, i: number) => (<motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-card rounded-lg p-6 min-w-[180px]" style={{ boxShadow: "var(--shadow-md)" }}><div className="text-2xl font-bold text-primary">#{i + 1}</div><div className="font-medium">{d?.nickname ?? "Anonymous"}</div></motion.div>))}</div></div></section>)}

      <section className="py-20 bg-secondary/20"><div className="max-w-[600px] mx-auto px-4 sm:px-6"><div className="text-center mb-8"><Send className="h-8 w-8 text-primary mx-auto mb-4" /><h2 className="font-display text-2xl font-bold tracking-tight">Get in Touch</h2><p className="text-sm text-muted-foreground mt-2">Leave a message — appears after approval.</p></div><form onSubmit={handleContact} className="space-y-4"><input type="text" value={contactForm?.name ?? ""} onChange={(e: any) => setContactForm((p: any) => ({ ...(p ?? {}), name: e?.target?.value ?? "" }))} placeholder="Your name" required className="w-full h-11 px-4 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary" /><input type="email" value={contactForm?.email ?? ""} onChange={(e: any) => setContactForm((p: any) => ({ ...(p ?? {}), email: e?.target?.value ?? "" }))} placeholder="Email (optional)" className="w-full h-11 px-4 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary" /><textarea value={contactForm?.message ?? ""} onChange={(e: any) => setContactForm((p: any) => ({ ...(p ?? {}), message: e?.target?.value ?? "" }))} placeholder="Your message" required maxLength={500} rows={4} className="w-full px-4 py-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" /><button type="submit" disabled={sending} className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50">{sending ? "Sending..." : "Send Message"}</button></form></div></section>
    </div>
  );
}
