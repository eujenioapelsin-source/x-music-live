export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = new URL(req.url).searchParams.get("token");
    if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { downloadToken: token }, include: { product: true } });
    if (!order) return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    if (order?.tokenExpiry && new Date() > order.tokenExpiry) {
      return NextResponse.json({ error: "Download link expired" }, { status: 410 });
    }

    const downloadUrl = order?.product?.downloadUrl;
    if (!downloadUrl) {
      return NextResponse.json({ error: "Download not available" }, { status: 404 });
    }

    return NextResponse.redirect(downloadUrl);
  } catch {
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
