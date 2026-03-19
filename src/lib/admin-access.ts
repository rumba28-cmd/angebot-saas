import { notFound } from "next/navigation";
import { getDemoUser } from "@/lib/demo-user";

export async function requireOwnerAdmin() {
  const user = await getDemoUser();

  const allowedEmails = (process.env.OWNER_ADMIN_EMAILS || "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);

  const isAllowed =
    user.role === "ADMIN" && allowedEmails.includes(user.email.toLowerCase());

  if (!isAllowed) {
    notFound();
  }

  return user;
}