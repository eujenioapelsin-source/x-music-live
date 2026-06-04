export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const donations = await prisma.donation.findMany({ orderBy: { createdAt: "desc" } });
    const csv = ["id,nickname,email,amount,currency,type,status,createdAt"];
    for (const d of donations ?? []) {
      csv.push(`${d?.id},"${d?.donorNickname ?? ""}",${d?.donorEmail ?? ""},${d?.amount},${d?.currency},${d?.type},${d?.status},${d?.createdAt?.toISOString?.() ?? ""}`);
    }

    return new NextResponse(csv.join("\n"), {
      headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=donations.csv" },
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
