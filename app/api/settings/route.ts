export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAllSettings } from "@/lib/settings";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const keys = url.searchParams.get("keys")?.split(",")?.filter(Boolean) ?? [];
    const all = await getAllSettings();
    if (keys?.length > 0) {
      const filtered: Record<string, any> = {};
      for (const k of keys) { filtered[k] = all?.[k] ?? null; }
      return NextResponse.json(filtered);
    }
    return NextResponse.json(all ?? {});
  } catch {
    return NextResponse.json({});
  }
}
