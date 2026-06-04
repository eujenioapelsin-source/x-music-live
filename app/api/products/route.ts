export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type") ?? "";
    const genre = url.searchParams.get("genre") ?? "";
    const search = url.searchParams.get("search") ?? "";
    const featured = url.searchParams.get("featured");

    const where: any = { published: true };
    if (type && type !== "all") where.type = type;
    if (genre) where.genre = genre;
    if (featured === "true") where.featured = true;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" as any } },
        { description: { contains: search, mode: "insensitive" as any } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { tracks: { orderBy: { trackNumber: "asc" } } },
    });

    return NextResponse.json(products ?? []);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
