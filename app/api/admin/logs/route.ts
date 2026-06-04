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
    const page = parseInt(url.searchParams.get("page") ?? "1", 10);
    const search = url.searchParams.get("search") ?? "";
    const limit = 50;

    const where: any = {};
    if (search) {
      where.OR = [
        { action: { contains: search, mode: "insensitive" as any } },
        { ipAddress: { contains: search } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({ where, orderBy: { createdAt: "desc" }, take: limit, skip: (page - 1) * limit }),
      prisma.adminLog.count({ where }),
    ]);

    return NextResponse.json({ logs: logs ?? [], total, pages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ logs: [], total: 0, pages: 0 });
  }
}
