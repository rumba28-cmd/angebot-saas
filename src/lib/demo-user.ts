import { prisma } from "./prisma";

export async function getDemoUser() {
  const email = process.env.DEMO_USER_EMAIL || "demo@angebot.de";
  const user = await prisma.user.findUnique({
    where: { email },
    include: { companyProfile: true }
  });

  if (!user) throw new Error("Demo user not found. Run seed.");
  return user;
}