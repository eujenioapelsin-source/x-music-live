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
    const status = url.searchParams.get("status") ?? "";
    const search = url.searchParams.get("search") ?? "";

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { buyerEmail: { contains: search, mode: "insensitive" as any } },
        { product: { title: { contains: search, mode: "insensitive" as any } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { product: { select: { title: true, artworkUrl: true } } },
    });
    return NextResponse.json(orders ?? []);
  } catch {
    return NextResponse.json([]);
  }
}
