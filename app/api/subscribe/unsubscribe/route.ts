export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = new URL(req.url).searchParams.get("token");
    if (!token) return NextResponse.redirect(new URL("/?unsubscribed=error", req.url));

    const subscriber = await prisma.subscriber.findUnique({ where: { unsubscribeToken: token } });
    if (!subscriber) return NextResponse.redirect(new URL("/?unsubscribed=error", req.url));

    await prisma.subscriber.delete({ where: { id: subscriber.id } });
    return NextResponse.redirect(new URL("/?unsubscribed=success", req.url));
  } catch {
    return NextResponse.redirect(new URL("/?unsubscribed=error", req.url));
  }
}
