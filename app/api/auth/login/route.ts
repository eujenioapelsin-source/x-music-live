export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { sendSecurityAlert } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")?.[0]?.trim() ?? "unknown";

    // Check if IP is blocked
    const blocked = await prisma.blockedIP.findFirst({
      where: { ipAddress: ip, blockedUntil: { gt: new Date() } },
    });
    if (blocked) {
      return NextResponse.json({ error: "Too many failed attempts. Try again later." }, { status: 429 });
    }

    // Rate limit
    const rl = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many attempts. Please wait." }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const { email, password } = body ?? {};
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      await trackFailedLogin(ip, email);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user?.passwordHash ?? "");
    if (!valid) {
      await trackFailedLogin(ip, email);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Clear failed logins on success
    await prisma.failedLogin.deleteMany({ where: { ipAddress: ip } }).catch(() => {});

    return NextResponse.json({ success: true, user: { id: user?.id, email: user?.email, role: user?.role } });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function trackFailedLogin(ip: string, email: string) {
  try {
    const existing = await prisma.failedLogin.findFirst({ where: { ipAddress: ip } });
    if (existing) {
      const newAttempts = (existing?.attempts ?? 0) + 1;
      await prisma.failedLogin.update({ where: { id: existing.id }, data: { attempts: newAttempts, lastAttempt: new Date() } });
      if (newAttempts >= 3) {
        await prisma.blockedIP.create({
          data: { ipAddress: ip, reason: "3+ failed login attempts", blockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) },
        });
        await sendSecurityAlert("IP Blocked", `<p>IP <strong>${ip}</strong> has been blocked after ${newAttempts} failed login attempts for email: ${email}</p>`);
      }
    } else {
      await prisma.failedLogin.create({ data: { ipAddress: ip, email } });
    }
  } catch (err: any) {
    console.error("[FailedLogin] track error:", err?.message);
  }
}
