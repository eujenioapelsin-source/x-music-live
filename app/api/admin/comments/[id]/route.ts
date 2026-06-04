export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-log";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const data: any = {};
    if (body?.approved !== undefined) data.approved = body.approved;
    if (body?.adminNote !== undefined) data.adminNote = body.adminNote;

    const comment = await prisma.comment.update({ where: { id: params?.id }, data });
    await logAdminAction((session as any)?.user?.id, body?.approved ? "APPROVE_COMMENT" : "UPDATE_COMMENT", JSON.stringify({ id: params?.id }));
    return NextResponse.json(comment);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.comment.delete({ where: { id: params?.id } });
    await logAdminAction((session as any)?.user?.id, "DELETE_COMMENT", JSON.stringify({ id: params?.id }));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
