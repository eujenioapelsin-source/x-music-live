export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-log";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const product = await prisma.product.findUnique({ where: { id: params?.id }, include: { tracks: { orderBy: { trackNumber: "asc" } } } });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { tracks: trackData, ...productData } = body ?? {};
    if (productData?.releaseDate) productData.releaseDate = new Date(productData.releaseDate);

    // Remove fields that shouldn't be updated directly
    delete productData.id;
    delete productData.createdAt;
    delete productData.updatedAt;

    const product = await prisma.product.update({ where: { id: params?.id }, data: productData });

    // Update tracks if provided
    if (trackData) {
      await prisma.productTrack.deleteMany({ where: { productId: params?.id } });
      if (trackData?.length) {
        await prisma.productTrack.createMany({
          data: trackData.map((t: any, i: number) => ({
            productId: params?.id,
            trackNumber: t?.trackNumber ?? i + 1,
            title: t?.title ?? "",
            duration: t?.duration ?? null,
            audioUrl: t?.audioUrl ?? null,
          })),
        });
      }
    }

    await logAdminAction((session as any)?.user?.id, "UPDATE_PRODUCT", JSON.stringify({ id: product?.id, title: product?.title }));
    const updated = await prisma.product.findUnique({ where: { id: params?.id }, include: { tracks: true } });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const product = await prisma.product.findUnique({ where: { id: params?.id } });
    await prisma.product.delete({ where: { id: params?.id } });

    await logAdminAction((session as any)?.user?.id, "DELETE_PRODUCT", JSON.stringify({ id: params?.id, title: product?.title }));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
