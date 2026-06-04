export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { product: { select: { title: true } } } });
    const csv = ["id,product,buyerEmail,amount,currency,status,paypalOrderId,createdAt"];
    for (const o of orders ?? []) {
      csv.push(`${o?.id},"${o?.product?.title ?? ""}",${o?.buyerEmail},${o?.amount},${o?.currency},${o?.status},${o?.paypalOrderId ?? ""},${o?.createdAt?.toISOString?.() ?? ""}`);
    }

    return new NextResponse(csv.join("\n"), {
      headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=orders.csv" },
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
