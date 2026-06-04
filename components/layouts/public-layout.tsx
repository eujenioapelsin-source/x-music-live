import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen pt-16">{children}</main>
      <SiteFooter />
    </>
  );
}
