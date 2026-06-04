export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") ?? "1", 10);
    const limit = 20;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { approved: true },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.comment.count({ where: { approved: true } }),
    ]);

    return NextResponse.json({ comments: comments ?? [], total, pages: Math.ceil(total / limit), page });
  } catch {
    return NextResponse.json({ comments: [], total: 0, pages: 0, page: 1 });
  }
}
