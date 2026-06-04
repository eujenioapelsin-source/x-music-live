"use client";
import { useEffect, useState } from "react";
import { AdminLayout } from "../_components/admin-dashboard-client";
import { Shield, Ban, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export default function AdminSecurityPage() {
  const [data, setData] = useState<any>({ blocked: [], failedLogins: [] });
  const [logs, setLogs] = useState<any[]>([]);
  const [blockIp, setBlockIp] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const load = () => {
    fetch("/api/admin/blocked-ips").then((r: any) => r?.json?.()).then((d: any) => setData(d ?? { blocked: [], failedLogins: [] })).catch(() => {});
    fetch("/api/admin/logs?page=1").then((r: any) => r?.json?.()).then((d: any) => setLogs(d?.logs ?? [])).catch(() => {});
  };
  useEffect(() => { load(); }, []);
  const unblock = async (id: string) => { await fetch(`/api/admin/blocked-ips?id=${id}`, { method: "DELETE" }); toast.success("Unblocked"); load(); };
  const block = async () => { if (!blockIp) return; await fetch("/api/admin/blocked-ips", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ipAddress: blockIp, reason: blockReason, hours: 24 }) }); toast.success("Blocked"); setBlockIp(""); setBlockReason(""); load(); };

  return (
    <AdminLayout title="Security">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Ban className="h-4 w-4 text-primary" /> Blocked IPs</h3>
          <div className="flex gap-2 mb-4"><input type="text" value={blockIp} onChange={(e: any) => setBlockIp(e?.target?.value ?? "")} placeholder="IP Address" className="flex-1 h-9 px-3 rounded-lg bg-background border border-border text-sm" /><input type="text" value={blockReason} onChange={(e: any) => setBlockReason(e?.target?.value ?? "")} placeholder="Reason" className="flex-1 h-9 px-3 rounded-lg bg-background border border-border text-sm" /><button onClick={block} className="px-3 h-9 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium">Block</button></div>
          <div className="space-y-2">{(data?.blocked ?? []).map((b: any) => (<div key={b?.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded"><div><span className="text-sm font-mono">{b?.ipAddress ?? ""}</span><span className="text-xs text-muted-foreground ml-2">{b?.reason ?? ""}</span></div><button onClick={() => unblock(b?.id)} className="text-xs text-primary hover:underline">Unblock</button></div>))}{(data?.blocked?.length ?? 0) === 0 && <p className="text-sm text-muted-foreground">No blocked IPs.</p>}</div>
        </div>
        <div className="bg-card rounded-lg p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
          <h3 className="font-semibold mb-4">Failed Logins (24h)</h3>
          <div className="space-y-2">{(data?.failedLogins ?? []).map((f: any) => (<div key={f?.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded"><div><span className="text-sm font-mono">{f?.ipAddress ?? ""}</span><span className="text-xs text-muted-foreground ml-2">{f?.attempts ?? 0} attempts</span></div><span className="text-xs text-muted-foreground">{f?.lastAttempt ? new Date(f.lastAttempt).toLocaleString() : ""}</span></div>))}{(data?.failedLogins?.length ?? 0) === 0 && <p className="text-sm text-muted-foreground">No failed logins.</p>}</div>
        </div>
      </div>
      <div className="bg-card rounded-lg p-5 mt-6" style={{ boxShadow: "var(--shadow-sm)" }}>
        <h3 className="font-semibold mb-4">Admin Activity Log</h3>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border"><th className="text-left py-2 text-muted-foreground font-medium">Action</th><th className="text-left py-2 text-muted-foreground font-medium">IP</th><th className="text-left py-2 text-muted-foreground font-medium">Date</th></tr></thead><tbody>{(logs ?? []).slice(0, 20).map((l: any) => (<tr key={l?.id} className="border-b border-border last:border-0"><td className="py-2 font-mono text-xs">{l?.action ?? ""}</td><td className="py-2 text-muted-foreground text-xs">{l?.ipAddress ?? ""}</td><td className="py-2 text-muted-foreground text-xs">{l?.createdAt ? new Date(l.createdAt).toLocaleString() : ""}</td></tr>))}</tbody></table></div>
        {(logs?.length ?? 0) === 0 && <p className="text-sm text-muted-foreground">No activity logs.</p>}
      </div>
    </AdminLayout>
  );
}
