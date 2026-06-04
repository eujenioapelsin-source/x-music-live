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
    const events = await prisma.event.findMany({ orderBy: { date: "desc" } });
    return NextResponse.json(events ?? []);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const event = await prisma.event.create({
      data: {
        title: body?.title ?? "",
        description: body?.description ?? null,
        date: new Date(body?.date ?? Date.now()),
        externalLink: body?.externalLink ?? null,
        published: body?.published ?? false,
      },
    });
    await logAdminAction((session as any)?.user?.id, "CREATE_EVENT", JSON.stringify({ id: event?.id, title: event?.title }));
    return NextResponse.json(event);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
