import Link from "next/link";
import { Music, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <Music className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="font-display text-4xl font-bold mb-2">404</h1>
        <p className="text-muted-foreground mb-6">Page not found</p>
        <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90"><Home className="h-4 w-4" /> Back Home</Link>
      </div>
    </div>
  );
}
