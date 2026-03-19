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
    <div className="stack">
      <div className="card">
        <div className="toolbar">
          <div>
            <h1>Angebote</h1>
            <div className="muted">
              Hier erstellen und verwalten Sie Ihre Angebote.
            </div>
          </div>

          <Link href="/offers/new" className="button-link">
            Neues Angebot
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="list">
          {offers.map((offer) => (
            <div key={offer.id} className="list-item">
              <strong>{offer.offerNumber}</strong>
              <div>{offer.subject}</div>
              <div>Kunde: {offer.client.name}</div>
              <div>Status: {offer.status}</div>
              <div>Gesamt: {(offer.totalCents / 100).toFixed(2)} €</div>

              <div className="row" style={{ marginTop: 10 }}>
                <Link href={`/offers/${offer.id}`}>Öffnen</Link>
                <Link href={`/invoices/from-offer/${offer.id}`}>
                  Rechnung daraus erstellen
                </Link>
              </div>
            </div>
          ))}

          {offers.length === 0 && (
            <div className="muted">Noch keine Angebote vorhanden.</div>
          )}
        </div>
      </div>
    </div>
  );
}