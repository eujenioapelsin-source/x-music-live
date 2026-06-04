export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-log";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const type = url.searchParams.get("type") ?? "";
    const search = url.searchParams.get("search") ?? "";
    const published = url.searchParams.get("published");

    const where: any = {};
    if (type) where.type = type;
    if (published !== null && published !== undefined && published !== "") where.published = published === "true";
    if (search) where.title = { contains: search, mode: "insensitive" as any };

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { tracks: { orderBy: { trackNumber: "asc" } } },
    });
    return NextResponse.json(products ?? []);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { tracks: trackData, ...productData } = body ?? {};

    // Auto-generate slug
    if (!productData?.slug && productData?.title) {
      productData.slug = productData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    if (productData?.releaseDate) productData.releaseDate = new Date(productData.releaseDate);

    const product = await prisma.product.create({
      data: {
        ...productData,
        tracks: trackData?.length ? { create: trackData.map((t: any, i: number) => ({ trackNumber: t?.trackNumber ?? i + 1, title: t?.title ?? "", duration: t?.duration ?? null, audioUrl: t?.audioUrl ?? null })) } : undefined,
      },
      include: { tracks: true },
    });

    await logAdminAction((session as any)?.user?.id, "CREATE_PRODUCT", JSON.stringify({ id: product?.id, title: product?.title }));
    return NextResponse.json(product);
  } catch (err: any) {
    console.error("[Admin] Create product error:", err?.message);
    return NextResponse.json({ error: err?.message ?? "Failed" }, { status: 500 });
  }
}
