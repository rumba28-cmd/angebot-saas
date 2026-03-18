import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";

export default async function OffersPage() {
  const user = await getDemoUser();
  const offers = await prisma.offer.findMany({
    where: { userId: user.id },
    include: { client: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="card">
      <h1>Angebote</h1>
      <div className="list">
        {offers.map((offer) => (
          <div key={offer.id} className="list-item">
            <strong>{offer.offerNumber}</strong>
            <div>{offer.subject}</div>
            <div>Kunde: {offer.client.name}</div>
            <div>Gesamt: {(offer.totalCents / 100).toFixed(2)} €</div>
            <Link href={`/offers/${offer.id}`}>Öffnen</Link>
          </div>
        ))}
      </div>
    </div>
  );
}