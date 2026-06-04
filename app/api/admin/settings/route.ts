export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllSettings, setSetting } from "@/lib/settings";
import { logAdminAction } from "@/lib/admin-log";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const settings = await getAllSettings();
    return NextResponse.json(settings ?? {});
  } catch {
    return NextResponse.json({});
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    for (const [key, value] of Object.entries(body ?? {})) {
      await setSetting(key, value);
    }
    await logAdminAction((session as any)?.user?.id, "UPDATE_SETTINGS", JSON.stringify(Object.keys(body ?? {})));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
