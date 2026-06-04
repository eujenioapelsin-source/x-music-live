"use client";
import { useEffect, useState } from "react";
import { Radio } from "lucide-react";

export function RadioClient() {
  const [embedCode, setEmbedCode] = useState("");
  useEffect(() => {
    fetch("/api/settings?keys=radio_embed_code").then((r: any) => r?.json?.()).then((d: any) => setEmbedCode(d?.radio_embed_code ?? "")).catch(() => {});
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8 text-center"><Radio className="h-8 w-8 text-primary mx-auto mb-3" /><h1 className="font-display text-3xl font-bold tracking-tight">Radio</h1><p className="text-muted-foreground mt-1">Listen to X Music radio — non-stop electronic music.</p></div>
      {embedCode ? (
        <div className="max-w-[800px] mx-auto rounded-lg overflow-hidden bg-card p-4" style={{ boxShadow: "var(--shadow-md)" }} dangerouslySetInnerHTML={{ __html: embedCode }} />
      ) : (
        <div className="text-center py-20 bg-card rounded-lg" style={{ boxShadow: "var(--shadow-md)" }}>
          <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Radio player coming soon. Check back later!</p>
          <p className="text-xs text-muted-foreground mt-2">Admin can add the radio embed code in Settings.</p>
        </div>
      )}
    </div>
  );
}
