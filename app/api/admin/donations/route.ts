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
    const type = url.searchParams.get("type") ?? "";
    const search = url.searchParams.get("search") ?? "";

    const where: any = {};
    if (type) where.type = type;
    if (search) where.donorNickname = { contains: search, mode: "insensitive" as any };

    const donations = await prisma.donation.findMany({ where, orderBy: { createdAt: "desc" } });
    return NextResponse.json(donations ?? []);
  } catch {
    return NextResponse.json([]);
  }
}
