export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-log";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const blocked = await prisma.blockedIP.findMany({ orderBy: { createdAt: "desc" } });
    const failedLogins = await prisma.failedLogin.findMany({
      where: { lastAttempt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      orderBy: { lastAttempt: "desc" },
    });

    return NextResponse.json({ blocked: blocked ?? [], failedLogins: failedLogins ?? [] });
  } catch {
    return NextResponse.json({ blocked: [], failedLogins: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { ipAddress, reason, hours } = body ?? {};
    if (!ipAddress) return NextResponse.json({ error: "IP required" }, { status: 400 });

    await prisma.blockedIP.create({
      data: {
        ipAddress,
        reason: reason ?? "Manual block",
        blockedUntil: new Date(Date.now() + (hours ?? 24) * 60 * 60 * 1000),
      },
    });
    await logAdminAction((session as any)?.user?.id, "BLOCK_IP", JSON.stringify({ ipAddress, reason }));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.blockedIP.delete({ where: { id } });
    await logAdminAction((session as any)?.user?.id, "UNBLOCK_IP", JSON.stringify({ id }));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
