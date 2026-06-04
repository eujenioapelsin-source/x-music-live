export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layouts/providers";
import { Toaster } from "sonner";
import ChunkLoadErrorHandler from "./chunk-load-error-handler";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
  title: "X Music - Electronic Music Producer & DJ",
  description: "Explore the world of electronic music by X. Tracks, albums, DJ mixes, live sets, and more.",
  keywords: "electronic music, DJ, producer, tracks, albums, X Music",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: { title: "X Music", description: "Electronic music crafted with passion.", images: ["/og-image.png"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" />
      </head>
      <body className="font-sans antialiased min-h-screen">
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
        <ChunkLoadErrorHandler />
      </body>
    </html>
  );
}
