export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")?.[0]?.trim() ?? "unknown";
    const rl = rateLimit(`comment:${ip}`, 5, 60 * 1000);
    if (!rl.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const { name, message, email, recaptchaToken } = body ?? {};

    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Name and message are required" }, { status: 400 });
    }
    if ((message?.length ?? 0) > 500) {
      return NextResponse.json({ error: "Message too long (max 500 chars)" }, { status: 400 });
    }

    // Verify reCAPTCHA if key is configured
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret && recaptchaSecret !== "RECAPTCHA_SECRET_KEY_PLACEHOLDER" && recaptchaToken) {
      try {
        const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${recaptchaSecret}&response=${recaptchaToken}`,
        });
        const verifyData = await verifyRes.json().catch(() => ({}));
        if (!(verifyData?.success) || (verifyData?.score ?? 0) < 0.5) {
          return NextResponse.json({ error: "reCAPTCHA verification failed" }, { status: 400 });
        }
      } catch {
        // Continue if reCAPTCHA verification fails
      }
    }

    await prisma.comment.create({
      data: {
        name: name?.trim(),
        message: message?.trim(),
        email: email?.trim() || null,
        ipAddress: ip,
        approved: false,
      },
    });

    return NextResponse.json({ message: "Thank you! Your comment is awaiting approval." });
  } catch {
    return NextResponse.json({ error: "Failed to submit comment" }, { status: 500 });
  }
}
