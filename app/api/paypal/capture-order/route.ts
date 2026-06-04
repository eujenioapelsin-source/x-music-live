export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { capturePayPalOrder } from "@/lib/paypal";
import { sendEmail } from "@/lib/email";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { orderId, type, productId, email, name, nickname, amount, currency } = body ?? {};
    if (!orderId) return NextResponse.json({ error: "Order ID required" }, { status: 400 });

    const capture = await capturePayPalOrder(orderId);
    if (capture?.status !== "COMPLETED") {
      return NextResponse.json({ error: "Payment not completed", details: capture }, { status: 400 });
    }

    if (type === "product" && productId) {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      const downloadToken = uuidv4();
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.order.create({
        data: {
          productId,
          buyerEmail: email ?? "",
          buyerName: name ?? "",
          amount: product?.price ?? 0,
          currency: product?.currency ?? "USD",
          status: "completed",
          paypalOrderId: orderId,
          downloadToken,
          tokenExpiry,
          type: "product",
        },
      });

      await prisma.product.update({ where: { id: productId }, data: { purchaseCount: { increment: 1 } } }).catch(() => {});

      const baseUrl = process.env.NEXTAUTH_URL ?? "";
      const downloadUrl = `${baseUrl}/api/download?token=${downloadToken}`;
      if (email) {
        await sendEmail(email, `Your X Music Purchase: ${product?.title ?? "Track"}`,
          `<div style="font-family:sans-serif;padding:20px;background:#0F1417;color:#E8E4DC;">
            <h2 style="color:#A38F6B;">Thank You!</h2>
            <p>Your purchase of <strong>${product?.title ?? "Track"}</strong> is complete.</p>
            <a href="${downloadUrl}" style="display:inline-block;padding:12px 24px;background:#A38F6B;color:#0F1417;text-decoration:none;border-radius:6px;font-weight:bold;">Download Now</a>
            <p style="margin-top:16px;font-size:12px;color:#9AA4B2;">This link expires in 24 hours.</p>
          </div>`);
      }

      return NextResponse.json({ success: true, downloadToken });
    }

    if (type === "donation") {
      await prisma.donation.create({
        data: {
          donorNickname: nickname ?? "Anonymous",
          donorEmail: email ?? null,
          amount: amount ?? 0,
          currency: currency ?? "EUR",
          type: "one-time",
          paypalOrderId: orderId,
          status: "completed",
        },
      });
      return NextResponse.json({ success: true });
    }

    if (type === "license") {
      const downloadToken = uuidv4();
      await prisma.order.create({
        data: {
          buyerEmail: email ?? "",
          buyerName: name ?? "",
          amount: amount ?? 20,
          currency: "USD",
          status: "completed",
          paypalOrderId: orderId,
          downloadToken,
          tokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
          type: "license",
        },
      });
      return NextResponse.json({ success: true, downloadToken });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[PayPal] Capture error:", err?.message);
    return NextResponse.json({ error: "Failed to capture" }, { status: 500 });
  }
}
