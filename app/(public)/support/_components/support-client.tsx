"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Trophy, CreditCard } from "lucide-react";
import { toast } from "sonner";

export function SupportClient() {
  const [donators, setDonators] = useState<any[]>([]);
  const [amount, setAmount] = useState(5);
  const [nickname, setNickname] = useState("");
  const [subAmount, setSubAmount] = useState(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/donations").then((r: any) => r?.json?.()).then((d: any) => setDonators(d?.topDonators ?? [])).catch(() => {});
  }, []);

  const handleDonate = async () => {
    if (amount < 1) { toast.error("Minimum €1"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/paypal/create-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "donation", amount, currency: "EUR", nickname: nickname || "Anonymous" }) });
      const data = await res?.json?.().catch(() => ({}));
      if (data?.approveUrl) window.open(data.approveUrl, "_blank");
      else toast.info("Configure PayPal credentials to enable donations.");
    } catch { toast.error("Failed"); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10 text-center"><Heart className="h-8 w-8 text-primary mx-auto mb-3" /><h1 className="font-display text-3xl font-bold tracking-tight">Support X Music</h1><p className="text-muted-foreground mt-1">Your support helps create more music.</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-lg p-6" style={{ boxShadow: "var(--shadow-md)" }}>
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> One-Time Tip</h2>
          <input type="text" value={nickname} onChange={(e: any) => setNickname(e?.target?.value ?? "")} placeholder="Nickname (optional)" className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm mb-3 focus:outline-none focus:ring-1 focus:ring-primary" />
          <div className="flex items-center gap-2 mb-4"><span className="text-lg font-bold">€</span><input type="number" value={amount} onChange={(e: any) => setAmount(Number(e?.target?.value) || 0)} min={1} className="w-24 h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary" /></div>
          <button onClick={handleDonate} disabled={loading} className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50">{loading ? "Processing..." : "Donate with PayPal"}</button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-lg p-6" style={{ boxShadow: "var(--shadow-md)" }}>
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2"><Heart className="h-5 w-5 text-primary" /> Monthly Support</h2>
          <div className="flex flex-wrap gap-2 mb-4">{[3, 5, 10, 20].map((a: number) => (<button key={a} onClick={() => setSubAmount(a)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${subAmount === a ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>€{a}/mo</button>))}</div>
          <p className="text-xs text-muted-foreground mb-4">Monthly subscriptions require PayPal subscription plans to be configured.</p>
          <button className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity" onClick={() => toast.info("Configure PayPal subscription plans in admin settings.")}>Subscribe with PayPal</button>
        </motion.div>
      </div>

      {(donators?.length ?? 0) > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <Trophy className="h-8 w-8 text-primary mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold mb-6">Top Supporters This Month</h2>
          <div className="flex flex-wrap justify-center gap-4">{(donators ?? []).map((d: any, i: number) => (<div key={i} className="bg-card rounded-lg p-5 min-w-[150px]" style={{ boxShadow: "var(--shadow-sm)" }}><div className="text-xl font-bold text-primary">#{i + 1}</div><div className="font-medium text-sm">{d?.nickname ?? "Anonymous"}</div></div>))}</div>
        </motion.div>
      )}
    </div>
  );
}
