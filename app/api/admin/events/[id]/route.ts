export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-log";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const data: any = {};
    if (body?.title !== undefined) data.title = body.title;
    if (body?.description !== undefined) data.description = body.description;
    if (body?.date !== undefined) data.date = new Date(body.date);
    if (body?.externalLink !== undefined) data.externalLink = body.externalLink;
    if (body?.published !== undefined) data.published = body.published;

    const event = await prisma.event.update({ where: { id: params?.id }, data });
    await logAdminAction((session as any)?.user?.id, "UPDATE_EVENT", JSON.stringify({ id: event?.id }));
    return NextResponse.json(event);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await prisma.event.delete({ where: { id: params?.id } });
    await logAdminAction((session as any)?.user?.id, "DELETE_EVENT", JSON.stringify({ id: params?.id }));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
