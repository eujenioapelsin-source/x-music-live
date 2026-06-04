"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Music, Package, ShoppingCart, Heart, Users, MessageSquare, Calendar, Settings, Shield, LogOut, User, LayoutDashboard, FileText } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/admin/donations", icon: Heart, label: "Donations" },
  { href: "/admin/comments", icon: MessageSquare, label: "Comments" },
  { href: "/admin/events", icon: Calendar, label: "Events" },
  { href: "/admin/subscribers", icon: Users, label: "Subscribers" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
  { href: "/admin/security", icon: Shield, label: "Security" },
  { href: "/admin/profile", icon: User, label: "Profile" },
];

export function AdminLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const { data: session, status } = useSession() || {};
  const router = useRouter();

  useEffect(() => { if (status === "unauthenticated") router.replace("/admin/login"); }, [status, router]);

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3"><Link href="/admin" className="flex items-center gap-2"><Music className="h-5 w-5 text-primary" /><span className="font-display font-bold text-sm">X Music Admin</span></Link></div>
          <div className="flex items-center gap-2"><Link href="/" className="text-xs text-muted-foreground hover:text-primary">View Site</Link><ThemeToggle /><button onClick={() => signOut({ callbackUrl: "/admin/login" })} className="p-2 rounded-lg hover:bg-secondary"><LogOut className="h-4 w-4" /></button></div>
        </div>
      </header>
      <div className="flex">
        <aside className="hidden md:block w-52 min-h-[calc(100vh-56px)] border-r border-border p-3">
          <nav className="space-y-1">{navItems.map((item: any) => (<Link key={item?.href} href={item?.href} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><item.icon className="h-4 w-4" />{item?.label}</Link>))}</nav>
        </aside>
        <main className="flex-1 p-4 md:p-6 max-w-[1200px]">
          {title && <h1 className="font-display text-2xl font-bold tracking-tight mb-6">{title}</h1>}
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminDashboardClient() {
  const [stats, setStats] = useState<any>({});
  useEffect(() => { fetch("/api/admin/stats").then((r: any) => r?.json?.()).then((d: any) => setStats(d ?? {})).catch(() => {}); }, []);

  const statCards = [
    { label: "Products", value: stats?.totalProducts ?? 0, icon: Package, href: "/admin/products" },
    { label: "Orders", value: stats?.totalOrders ?? 0, icon: ShoppingCart, href: "/admin/orders" },
    { label: "Donations (Month)", value: `€${(stats?.monthlyDonations ?? 0)?.toFixed?.(2)}`, icon: Heart, href: "/admin/donations" },
    { label: "Subscribers", value: stats?.totalSubscribers ?? 0, icon: Users, href: "/admin/subscribers" },
    { label: "Pending Comments", value: stats?.pendingComments ?? 0, icon: MessageSquare, href: "/admin/comments" },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((s: any, i: number) => (
          <Link key={i} href={s?.href ?? "#"} className="bg-card rounded-lg p-5 hover:bg-card/80 transition-colors" style={{ boxShadow: "var(--shadow-sm)" }}>
            <div className="flex items-center justify-between mb-3"><s.icon className="h-5 w-5 text-primary" /><span className="text-xs text-muted-foreground">{s?.label}</span></div>
            <div className="text-2xl font-bold">{s?.value ?? 0}</div>
          </Link>
        ))}
      </div>
      <div className="bg-card rounded-lg p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
        <h2 className="font-display text-lg font-semibold mb-4">Recent Orders</h2>
        {(stats?.recentOrders?.length ?? 0) > 0 ? (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border"><th className="text-left py-2 text-muted-foreground font-medium">Product</th><th className="text-left py-2 text-muted-foreground font-medium">Buyer</th><th className="text-left py-2 text-muted-foreground font-medium">Amount</th><th className="text-left py-2 text-muted-foreground font-medium">Status</th></tr></thead><tbody>{(stats?.recentOrders ?? []).map((o: any) => (<tr key={o?.id} className="border-b border-border last:border-0"><td className="py-2">{o?.product?.title ?? "N/A"}</td><td className="py-2 text-muted-foreground">{o?.buyerEmail ?? ""}</td><td className="py-2">${o?.amount?.toFixed?.(2) ?? "0.00"}</td><td className="py-2"><span className={`px-2 py-0.5 rounded text-xs ${o?.status === "completed" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>{o?.status ?? "pending"}</span></td></tr>))}</tbody></table></div>
        ) : <p className="text-muted-foreground text-sm">No orders yet.</p>}
      </div>
    </AdminLayout>
  );
}
