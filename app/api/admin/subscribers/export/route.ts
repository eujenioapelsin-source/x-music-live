export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const subscribers = await prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } });
    const csv = ["email,confirmed,createdAt"];
    for (const s of subscribers ?? []) {
      csv.push(`${s?.email},${s?.confirmed},${s?.createdAt?.toISOString?.() ?? ""}`);
    }

    return new NextResponse(csv.join("\n"), {
      headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=subscribers.csv" },
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
