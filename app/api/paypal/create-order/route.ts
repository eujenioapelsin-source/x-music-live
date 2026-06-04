export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createPayPalOrder } from "@/lib/paypal";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")?.[0]?.trim() ?? "unknown";
    const rl = rateLimit(`paypal:${ip}`, 10, 60 * 1000);
    if (!rl.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const { productId, type, amount, currency, nickname, email } = body ?? {};

    let orderAmount = amount ?? 0;
    let orderCurrency = currency ?? "USD";
    let description = "";

    if (type === "product" && productId) {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
      orderAmount = product?.price ?? 0;
      orderCurrency = product?.currency ?? "USD";
      description = `Purchase: ${product?.title ?? "Product"}`;
    } else if (type === "donation") {
      description = `Donation from ${nickname ?? "Anonymous"}`;
      orderCurrency = currency ?? "EUR";
    } else if (type === "license") {
      description = "Music License Purchase";
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (orderAmount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    const paypalOrder = await createPayPalOrder(orderAmount, orderCurrency, description);
    if (!paypalOrder?.id) return NextResponse.json({ error: "PayPal error" }, { status: 500 });

    return NextResponse.json({ orderId: paypalOrder?.id, approveUrl: paypalOrder?.links?.find((l: any) => l?.rel === "approve")?.href });
  } catch (err: any) {
    console.error("[PayPal] Create order error:", err?.message);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
