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
    const confirmed = url.searchParams.get("confirmed");
    const search = url.searchParams.get("search") ?? "";

    const where: any = {};
    if (confirmed !== null && confirmed !== undefined && confirmed !== "") where.confirmed = confirmed === "true";
    if (search) where.email = { contains: search, mode: "insensitive" as any };

    const subscribers = await prisma.subscriber.findMany({ where, orderBy: { createdAt: "desc" } });
    return NextResponse.json(subscribers ?? []);
  } catch {
    return NextResponse.json([]);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.subscriber.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
