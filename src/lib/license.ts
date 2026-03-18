import crypto from "crypto";
import { prisma } from "./prisma";

const MAP: Record<string, string> = {
  MONO_MONTH_1: "M1",
  MONO_YEAR_1: "Y1",
  TEAM_MONTH_3: "M3",
  TEAM_YEAR_3: "Y3"
};

function randomBlock(length = 4) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function hashKey(rawKey: string) {
  return crypto.createHash("sha256").update(rawKey.trim().toUpperCase()).digest("hex");
}

export function createReadableKey(shortCode: string) {
  const a = randomBlock();
  const b = randomBlock();
  const c = randomBlock();

  const rawKey = `ANGB-${shortCode}-${a}-${b}-${c}`;
  return {
    rawKey,
    codeHash: hashKey(rawKey),
    codePreview: `ANGB-${shortCode}-****-****-${c}`
  };
}

export async function createLicenseKeys(planId: string, count: number, adminUserId?: string) {
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error("Plan not found");

  const shortCode = MAP[plan.code];
  if (!shortCode) throw new Error("Unknown plan code");

  const keys: { rawKey: string; codePreview: string }[] = [];

  for (let i = 0; i < count; i++) {
    const { rawKey, codeHash, codePreview } = createReadableKey(shortCode);

    await prisma.licenseKey.create({
      data: {
        planId: plan.id,
        codeHash,
        codePreview,
        status: "AVAILABLE",
        maxActivations: 1,
        activationCount: 0,
        createdByAdminId: adminUserId
      }
    });

    keys.push({ rawKey, codePreview });
  }

  return keys;
}

export async function activateLicense(userId: string, rawKey: string) {
  const codeHash = hashKey(rawKey);

  const key = await prisma.licenseKey.findUnique({
    where: { codeHash },
    include: { plan: true }
  });

  if (!key) throw new Error("Invalid key");
  if (key.status !== "AVAILABLE") throw new Error("Key not available");
  if (key.validUntil && key.validUntil < new Date()) throw new Error("Key expired");

  const now = new Date();

  const existing = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      endsAt: { gt: now }
    },
    include: { plan: true },
    orderBy: { endsAt: "desc" }
  });

  let startsAt = now;
  let endsAt = new Date(now);

  if (existing && existing.planId === key.planId) {
    startsAt = existing.startsAt;
    endsAt = new Date(existing.endsAt);
    endsAt.setMonth(endsAt.getMonth() + key.plan.durationMonths);

    await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        endsAt,
        licenseKeyId: key.id
      }
    });
  } else {
    endsAt.setMonth(endsAt.getMonth() + key.plan.durationMonths);

    await prisma.subscription.create({
      data: {
        userId,
        planId: key.planId,
        source: "license_key",
        status: "ACTIVE",
        startsAt,
        endsAt,
        autoRenew: false,
        licenseKeyId: key.id
      }
    });
  }

  await prisma.licenseKey.update({
    where: { id: key.id },
    data: {
      status: "ACTIVATED",
      activationCount: { increment: 1 },
      activatedByUserId: userId,
      activatedAt: now
    }
  });

  return {
    plan: key.plan.name,
    endsAt
  };
}