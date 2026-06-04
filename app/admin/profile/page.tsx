"use client";
import { useState } from "react";
import { AdminLayout } from "../_components/admin-dashboard-client";
import { User, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminProfilePage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("Passwords don't match"); return; }
    if ((newPassword?.length ?? 0) < 8) { toast.error("Min 8 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, newPassword }) });
      const data = await res?.json?.().catch(() => ({}));
      if (res?.ok) { toast.success("Password updated!"); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); } else toast.error(data?.error ?? "Failed");
    } catch { toast.error("Failed"); } finally { setLoading(false); }
  };

  return (
    <AdminLayout title="Profile">
      <div className="max-w-[400px] bg-card rounded-lg p-6" style={{ boxShadow: "var(--shadow-md)" }}>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Change Password</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-xs text-muted-foreground">Current Password</label><input type="password" value={currentPassword} onChange={(e: any) => setCurrentPassword(e?.target?.value ?? "")} required className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm mt-1" /></div>
          <div><label className="text-xs text-muted-foreground">New Password</label><input type="password" value={newPassword} onChange={(e: any) => setNewPassword(e?.target?.value ?? "")} required className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm mt-1" /></div>
          <div><label className="text-xs text-muted-foreground">Confirm New Password</label><input type="password" value={confirmPassword} onChange={(e: any) => setConfirmPassword(e?.target?.value ?? "")} required className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm mt-1" /></div>
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50"><Save className="h-4 w-4" />{loading ? "Saving..." : "Update Password"}</button>
        </form>
      </div>
    </AdminLayout>
  );
}
