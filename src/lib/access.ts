import { prisma } from "./prisma";

export async function getActiveSubscription(userId: string) {
  const now = new Date();

  return prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      endsAt: { gt: now }
    },
    include: { plan: true },
    orderBy: { endsAt: "desc" }
  });
}

export async function requireActiveSubscription(userId: string) {
  const sub = await getActiveSubscription(userId);
  if (!sub) throw new Error("No active subscription");
  return sub;
}

export async function getLicenseUsageInfo(userId: string) {
  const sub = await getActiveSubscription(userId);

  if (!sub) {
    return {
      active: false,
      seatLimit: 0,
      allowSameUserMultiDevice: false,
      planName: null,
      endsAt: null
    };
  }

  return {
    active: true,
    seatLimit: sub.plan.seatLimit ?? sub.plan.deviceLimit ?? 1,
    allowSameUserMultiDevice:
      typeof sub.plan.allowSameUserMultiDevice === "boolean"
        ? sub.plan.allowSameUserMultiDevice
        : true,
    planName: sub.plan.name,
    endsAt: sub.endsAt
  };
}