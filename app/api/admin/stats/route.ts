export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [products, orders, donations, subscribers, pendingComments, recentOrders] = await Promise.all([
      prisma.product.count(),
      prisma.order.count({ where: { status: "completed" } }),
      prisma.donation.aggregate({ where: { status: "completed", createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),
      prisma.subscriber.count({ where: { confirmed: true } }),
      prisma.comment.count({ where: { approved: false } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { product: { select: { title: true } } } }),
    ]);

    return NextResponse.json({
      totalProducts: products ?? 0,
      totalOrders: orders ?? 0,
      monthlyDonations: donations?._sum?.amount ?? 0,
      totalSubscribers: subscribers ?? 0,
      pendingComments: pendingComments ?? 0,
      recentOrders: recentOrders ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
