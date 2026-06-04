"use client";
import { useEffect, useState } from "react";
import { AdminLayout } from "../_components/admin-dashboard-client";
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);
  useEffect(() => { fetch("/api/admin/settings").then((r: any) => r?.json?.()).then((d: any) => setSettings(d ?? {})).catch(() => {}); }, []);
  const update = (k: string, v: any) => setSettings((p: any) => ({ ...(p ?? {}), [k]: v }));
  const save = async () => { setLoading(true); try { await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) }); toast.success("Settings saved!"); } catch { toast.error("Failed"); } finally { setLoading(false); } };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (<div className="bg-card rounded-lg p-5 mb-4" style={{ boxShadow: "var(--shadow-sm)" }}><h3 className="font-semibold text-sm mb-4">{title}</h3>{children}</div>);
  const Field = ({ label, k, type, rows }: { label: string; k: string; type?: string; rows?: number }) => (<div className="mb-3"><label className="text-xs text-muted-foreground">{label}</label>{rows ? <textarea value={settings?.[k] ?? ""} onChange={(e: any) => update(k, e?.target?.value)} rows={rows} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm mt-1 resize-none" /> : <input type={type ?? "text"} value={settings?.[k] ?? ""} onChange={(e: any) => update(k, type === "number" ? parseFloat(e?.target?.value) || 0 : e?.target?.value)} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm mt-1" />}</div>);

  return (
    <AdminLayout title="Settings">
      <div className="max-w-[700px]">
        <Section title="Homepage Content"><Field label="Hero Heading" k="home_hero_heading" /><Field label="Hero Subheading" k="home_hero_subheading" /><Field label="About Heading" k="home_about_heading" /><Field label="About Text" k="home_about_text" rows={3} /></Section>
        <Section title="License"><Field label="Price ($)" k="license_price" type="number" /><Field label="Terms" k="license_terms" rows={4} /></Section>
        <Section title="Donations"><Field label="Default Amount (€)" k="donation_default_amount" type="number" /><Field label="Amount Options (comma-separated)" k="donation_amounts" /></Section>
        <Section title="Social Links"><Field label="YouTube" k="social_youtube" /><Field label="Instagram" k="social_instagram" /><Field label="Facebook" k="social_facebook" /><Field label="Twitter/X" k="social_twitter" /><Field label="SoundCloud" k="social_soundcloud" /><Field label="Spotify" k="social_spotify" /></Section>
        <Section title="Radio"><Field label="Embed Code (iframe)" k="radio_embed_code" rows={3} /></Section>
        <Section title="SEO"><Field label="Site Title" k="seo_title" /><Field label="Description" k="seo_description" rows={2} /><Field label="Keywords" k="seo_keywords" /></Section>
        <button onClick={save} disabled={loading} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 mt-2"><Save className="h-4 w-4" />{loading ? "Saving..." : "Save All Settings"}</button>
      </div>
    </AdminLayout>
  );
}
