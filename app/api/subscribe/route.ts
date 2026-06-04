export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")?.[0]?.trim() ?? "unknown";
    const rl = rateLimit(`subscribe:${ip}`, 5, 60 * 1000);
    if (!rl.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const email = body?.email?.trim()?.toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const existing = await prisma.subscriber.findUnique({ where: { email } });
    if (existing?.confirmed) {
      return NextResponse.json({ message: "You are already subscribed!" });
    }

    const confirmToken = uuidv4();
    const unsubscribeToken = uuidv4();

    if (existing) {
      await prisma.subscriber.update({ where: { email }, data: { confirmToken, unsubscribeToken } });
    } else {
      await prisma.subscriber.create({ data: { email, confirmToken, unsubscribeToken } });
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? "";
    const confirmUrl = `${baseUrl}/api/subscribe/confirm?token=${confirmToken}`;
    await sendEmail(email, "Confirm your subscription to X Music",
      `<div style="font-family:sans-serif;padding:20px;background:#0F1417;color:#E8E4DC;">
        <h2 style="color:#A38F6B;">X Music</h2>
        <p>Thanks for subscribing! Please confirm your email:</p>
        <a href="${confirmUrl}" style="display:inline-block;padding:12px 24px;background:#A38F6B;color:#0F1417;text-decoration:none;border-radius:6px;font-weight:bold;">Confirm Subscription</a>
        <p style="margin-top:16px;font-size:12px;color:#9AA4B2;">If you didn't subscribe, ignore this email.</p>
      </div>`);

    return NextResponse.json({ message: "Check your email to confirm your subscription!" });
  } catch {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
