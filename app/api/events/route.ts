export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const [upcoming, past] = await Promise.all([
      prisma.event.findMany({ where: { published: true, date: { gte: now } }, orderBy: { date: "asc" } }),
      prisma.event.findMany({ where: { published: true, date: { lt: now } }, orderBy: { date: "desc" } }),
    ]);
    return NextResponse.json({ upcoming: upcoming ?? [], past: past ?? [] });
  } catch {
    return NextResponse.json({ upcoming: [], past: [] });
  }
}
