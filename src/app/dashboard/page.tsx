import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";
import { getActiveSubscription } from "@/lib/access";

export default async function DashboardPage() {
  const user = await getDemoUser();
  const [clients, services, offers, sub] = await Promise.all([
    prisma.client.count({ where: { userId: user.id } }),
    prisma.serviceItem.count({ where: { userId: user.id, isArchived: false } }),
    prisma.offer.count({ where: { userId: user.id } }),
    getActiveSubscription(user.id)
  ]);

  return (
    <div className="grid-3">
      <div className="card">
        <div>Kunden</div>
        <div className="stats">{clients}</div>
      </div>
      <div className="card">
        <div>Leistungen</div>
        <div className="stats">{services}</div>
      </div>
      <div className="card">
        <div>Angebote</div>
        <div className="stats">{offers}</div>
      </div>

      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <h2>Aktive Lizenz</h2>
        {sub ? (
          <div>
            <div>{sub.plan.name}</div>
            <div>Gültig bis: {new Date(sub.endsAt).toLocaleDateString("de-DE")}</div>
            <div>Geräte: {sub.plan.deviceLimit}</div>
          </div>
        ) : (
          <div>Keine aktive Lizenz</div>
        )}
      </div>
    </div>
  );
}