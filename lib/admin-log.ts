import { prisma } from "./db";
import { headers } from "next/headers";

export async function logAdminAction(userId: string | null, action: string, details?: string) {
  try {
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")?.[0]?.trim() ?? "unknown";
    const ua = headersList.get("user-agent") ?? "unknown";
    await prisma.adminLog.create({
      data: { userId, action, details, ipAddress: ip, userAgent: ua },
    });
  } catch (err: any) {
    console.error("[AdminLog] Error:", err?.message);
  }
}
