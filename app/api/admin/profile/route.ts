export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { logAdminAction } from "@/lib/admin-log";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session as any)?.user?.id;
    const body = await req.json().catch(() => ({}));
    const { currentPassword, newPassword, email } = body ?? {};

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (newPassword) {
      if (!currentPassword) return NextResponse.json({ error: "Current password required" }, { status: 400 });
      const valid = await bcrypt.compare(currentPassword, user?.passwordHash ?? "");
      if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      if ((newPassword?.length ?? 0) < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

      const hash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });
      await logAdminAction(userId, "CHANGE_PASSWORD", "");
    }

    if (email && email !== user?.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      await prisma.user.update({ where: { id: userId }, data: { email } });
      await logAdminAction(userId, "CHANGE_EMAIL", JSON.stringify({ from: user?.email, to: email }));
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
