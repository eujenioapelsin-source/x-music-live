export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const event = JSON.parse(body);
    const eventType = event?.event_type ?? "";

    if (eventType === "PAYMENT.SALE.COMPLETED") {
      const resource = event?.resource ?? {};
      const subId = resource?.billing_agreement_id;
      if (subId) {
        await prisma.donation.create({
          data: {
            amount: parseFloat(resource?.amount?.total ?? "0"),
            currency: resource?.amount?.currency ?? "EUR",
            type: "monthly",
            paypalSubscriptionId: subId,
            paypalPayerId: resource?.payer?.payer_info?.payer_id ?? null,
            status: "completed",
          },
        });
      }
    }

    if (eventType === "BILLING.SUBSCRIPTION.CANCELLED" || eventType === "BILLING.SUBSCRIPTION.SUSPENDED") {
      const subId = event?.resource?.id;
      if (subId) {
        await prisma.donation.updateMany({
          where: { paypalSubscriptionId: subId },
          data: { status: "cancelled" },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[Webhook] Error:", err?.message);
    return NextResponse.json({ received: true });
  }
}
