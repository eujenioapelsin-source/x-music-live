export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { logAdminAction } from "@/lib/admin-log";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { subject, htmlBody } = body ?? {};
    if (!subject || !htmlBody) return NextResponse.json({ error: "Subject and body required" }, { status: 400 });

    const subscribers = await prisma.subscriber.findMany({ where: { confirmed: true } });
    let sent = 0;
    let failed = 0;

    for (const sub of subscribers ?? []) {
      const baseUrl = process.env.NEXTAUTH_URL ?? "";
      const unsubLink = `${baseUrl}/api/subscribe/unsubscribe?token=${sub?.unsubscribeToken}`;
      const html = `<div style="font-family:sans-serif;padding:20px;background:#0F1417;color:#E8E4DC;">
        <h2 style="color:#A38F6B;">X Music</h2>
        ${htmlBody}
        <hr style="border-color:#2A343A;margin:20px 0;">
        <p style="font-size:11px;color:#9AA4B2;"><a href="${unsubLink}" style="color:#A38F6B;">Unsubscribe</a></p>
      </div>`;
      const success = await sendEmail(sub?.email, subject, html);
      if (success) sent++; else failed++;
    }

    await logAdminAction((session as any)?.user?.id, "SEND_NEWSLETTER", JSON.stringify({ subject, sent, failed }));
    return NextResponse.json({ sent, failed, total: (subscribers?.length ?? 0) });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
