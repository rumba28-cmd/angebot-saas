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