import { prisma } from "./db";

export async function getSetting(key: string): Promise<any> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key } });
    if (!setting) return null;
    try { return JSON.parse(setting?.value ?? "null"); } catch { return setting?.value; }
  } catch { return null; }
}

export async function setSetting(key: string, value: any): Promise<void> {
  const strValue = typeof value === "string" ? value : JSON.stringify(value);
  await prisma.setting.upsert({ where: { key }, update: { value: strValue }, create: { key, value: strValue } });
}

export async function getAllSettings(): Promise<Record<string, any>> {
  try {
    const settings = await prisma.setting.findMany();
    const result: Record<string, any> = {};
    for (const s of settings ?? []) {
      try { result[s?.key] = JSON.parse(s?.value ?? "null"); } catch { result[s?.key] = s?.value; }
    }
    return result;
  } catch { return {}; }
}
