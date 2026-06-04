export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = new URL(req.url).searchParams.get("token");
    if (!token) return NextResponse.redirect(new URL("/?subscribed=error", req.url));

    const subscriber = await prisma.subscriber.findUnique({ where: { confirmToken: token } });
    if (!subscriber) return NextResponse.redirect(new URL("/?subscribed=error", req.url));

    await prisma.subscriber.update({ where: { id: subscriber.id }, data: { confirmed: true } });
    return NextResponse.redirect(new URL("/?subscribed=success", req.url));
  } catch {
    return NextResponse.redirect(new URL("/?subscribed=error", req.url));
  }
}
