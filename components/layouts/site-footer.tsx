"use client";

import Link from "next/link";
import { Music, Youtube, Instagram, Facebook, Twitter } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email?.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(data?.message ?? "Subscribed! Check your email to confirm.");
        setEmail("");
      } else {
        toast.error(data?.error ?? "Something went wrong");
      }
    } catch {
      toast.error("Failed to subscribe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Music className="h-5 w-5 text-primary" />
              <span className="font-display font-bold text-lg">X Music</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Electronic music crafted with passion. Explore tracks, albums, and live sets.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link href="/store" className="text-sm text-muted-foreground hover:text-primary transition-colors">Store</Link>
              <Link href="/events" className="text-sm text-muted-foreground hover:text-primary transition-colors">Events</Link>
              <Link href="/support" className="text-sm text-muted-foreground hover:text-primary transition-colors">Support</Link>
              <Link href="/license" className="text-sm text-muted-foreground hover:text-primary transition-colors">License</Link>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm mb-4">Stay Updated</h4>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e: any) => setEmail(e?.target?.value ?? "")}
                placeholder="Your email"
                className="flex-1 h-10 px-3 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "..." : "Subscribe"}
              </button>
            </form>
            <p className="text-xs text-muted-foreground mt-2">Join the mailing list for updates.</p>
            <div className="flex items-center gap-3 mt-4">
              <SocialIcon icon={Youtube} />
              <SocialIcon icon={Instagram} />
              <SocialIcon icon={Facebook} />
              <SocialIcon icon={Twitter} />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} X Music. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon: Icon }: { icon: any }) {
  return (
    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
