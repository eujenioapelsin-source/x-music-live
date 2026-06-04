export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const status = url.searchParams.get("status") ?? "all";

    const where: any = {};
    if (status === "pending") where.approved = false;
    if (status === "approved") where.approved = true;

    const comments = await prisma.comment.findMany({ where, orderBy: { createdAt: "desc" } });
    const pendingCount = await prisma.comment.count({ where: { approved: false } });

    return NextResponse.json({ comments: comments ?? [], pendingCount });
  } catch {
    return NextResponse.json({ comments: [], pendingCount: 0 });
  }
}
