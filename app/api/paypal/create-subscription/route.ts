export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createPayPalSubscription } from "@/lib/paypal";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")?.[0]?.trim() ?? "unknown";
    const rl = rateLimit(`sub:${ip}`, 5, 60 * 1000);
    if (!rl.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const { planId } = body ?? {};
    if (!planId) return NextResponse.json({ error: "Plan ID required" }, { status: 400 });

    const subscription = await createPayPalSubscription(planId);
    const approveLink = subscription?.links?.find((l: any) => l?.rel === "approve")?.href;

    return NextResponse.json({ subscriptionId: subscription?.id, approveUrl: approveLink });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
