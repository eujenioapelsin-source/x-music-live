"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Music, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

export function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", { redirect: false, email, password });
      if (result?.ok) { window.location.href = "/admin"; }
      else { toast.error("Invalid credentials"); }
    } catch { toast.error("Login failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8"><Music className="h-10 w-10 text-primary mx-auto mb-3" /><h1 className="font-display text-2xl font-bold">Admin Login</h1><p className="text-sm text-muted-foreground mt-1">Sign in to manage X Music</p></div>
        <form onSubmit={handleSubmit} className="bg-card rounded-lg p-6 space-y-4" style={{ boxShadow: "var(--shadow-lg)" }}>
          <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="email" value={email} onChange={(e: any) => setEmail(e?.target?.value ?? "")} placeholder="Email" required className="w-full h-11 pl-10 pr-4 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary" /></div>
          <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="password" value={password} onChange={(e: any) => setPassword(e?.target?.value ?? "")} placeholder="Password" required className="w-full h-11 pl-10 pr-4 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary" /></div>
          <button type="submit" disabled={loading} className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50">{loading ? "Signing in..." : "Sign In"}</button>
        </form>
      </div>
    </div>
  );
}
