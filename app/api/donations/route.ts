export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSetting } from "@/lib/settings";

export async function GET() {
  try {
    const isManual = await getSetting("top_donators_manual");
    if (isManual) {
      const manual = await getSetting("top_donators");
      return NextResponse.json({ topDonators: manual ?? [] });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const donations = await prisma.donation.findMany({
      where: { status: "completed", createdAt: { gte: startOfMonth } },
      select: { donorNickname: true, amount: true },
    });

    const totals: Record<string, number> = {};
    for (const d of donations ?? []) {
      const nick = d?.donorNickname ?? "Anonymous";
      totals[nick] = (totals[nick] ?? 0) + (d?.amount ?? 0);
    }

    const sorted = Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([nickname, amount]) => ({ nickname, amount }));

    return NextResponse.json({ topDonators: sorted });
  } catch {
    return NextResponse.json({ topDonators: [] });
  }
}
