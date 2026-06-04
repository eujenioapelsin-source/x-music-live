"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, CreditCard } from "lucide-react";
import { toast } from "sonner";

export function LicenseClient() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/settings?keys=license_price,license_currency,license_terms,license_heading,license_subheading").then((r: any) => r?.json?.()).then((d: any) => setSettings(d ?? {})).catch(() => {});
  }, []);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/paypal/create-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "license", amount: settings?.license_price ?? 20, currency: settings?.license_currency ?? "USD" }) });
      const data = await res?.json?.().catch(() => ({}));
      if (data?.approveUrl) window.open(data.approveUrl, "_blank");
      else toast.info("Configure PayPal credentials to enable purchases.");
    } catch { toast.error("Failed"); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-[700px] mx-auto px-4 sm:px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <FileText className="h-8 w-8 text-primary mx-auto mb-3" />
        <h1 className="font-display text-3xl font-bold tracking-tight">{settings?.license_heading ?? "License My Music"}</h1>
        <p className="text-muted-foreground mt-1">{settings?.license_subheading ?? "Use my tracks in your creative projects."}</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-lg p-8" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="text-center mb-6"><span className="text-4xl font-bold text-primary">${settings?.license_price ?? 20}</span><span className="text-muted-foreground ml-2">per track</span></div>
        <div className="text-sm text-muted-foreground leading-relaxed mb-8 whitespace-pre-wrap">{settings?.license_terms ?? "Standard license terms apply. Credit required."}</div>
        <button onClick={handleBuy} disabled={loading} className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"><CreditCard className="h-5 w-5" />{loading ? "Processing..." : "Purchase License"}</button>
      </motion.div>
    </div>
  );
}
