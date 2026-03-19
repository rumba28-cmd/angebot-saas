import { prisma } from "@/lib/prisma";

export async function canUseSameLoginOnPhoneAndComputer(userId: string) {
  const now = new Date();

  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      endsAt: { gt: now }
    },
    include: {
      plan: true
    },
    orderBy: {
      endsAt: "desc"
    }
  });

  if (!sub) {
    return {
      allowed: false,
      reason: "No active subscription"
    };
  }

  return {
    allowed: true,
    allowSameUserMultiDevice: sub.plan.allowSameUserMultiDevice,
    seatLimit: sub.plan.seatLimit,
    planName: sub.plan.name
  };
}