import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";
import { notFound } from "next/navigation";

export default async function ClientDetailPage({
  params
}: {
  params: { id: string };
}) {
  const user = await getDemoUser();

  const client = await prisma.client.findFirst({
    where: {
      id: params.id,
      userId: user.id
    }
  });

  if (!client) notFound();

  const [offers, invoices] = await Promise.all([
    prisma.offer.findMany({
      where: {
        userId: user.id,
        clientId: client.id
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.invoice.findMany({
      where: {
        userId: user.id,
        clientId: client.id
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <div className="stack">
      <div className="card">
        <div className="toolbar">
          <div>
            <h1>{client.name}</h1>
            <div className="muted">
              Gemeinsame Kundendaten für Angebot und Rechnung
            </div>
          </div>

          <div className="row">
            <Link className="button-link" href="/offers/new">
              Neues Angebot
            </Link>
            <Link className="button-link" href="/invoices/new">
              Neue Rechnung
            </Link>
          </div>
        </div>

        <div className="list" style={{ marginTop: 16 }}>
          <div className="list-item">
            <div><strong>E-Mail:</strong> {client.email || "—"}</div>
            <div><strong>Telefon:</strong> {client.phone || "—"}</div>
            <div><strong>Adresse:</strong> {client.addressLine1 || "—"}</div>
            <div>
              <strong>PLZ / Ort:</strong>{" "}
              {[client.postalCode, client.city].filter(Boolean).join(" ") || "—"}
            </div>
            <div><strong>Projektort:</strong> {client.projectLocation || "—"}</div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Angebote</h2>
          <div className="list">
            {offers.map((offer) => (
              <div key={offer.id} className="list-item">
                <strong>{offer.offerNumber}</strong>
                <div>{offer.subject}</div>
                <div>Status: {offer.status}</div>
                <div>Gesamt: {(offer.totalCents / 100).toFixed(2)} €</div>
                <Link href={`/offers/${offer.id}`}>Öffnen</Link>
              </div>
            ))}
            {offers.length === 0 && (
              <div className="muted">Keine Angebote vorhanden.</div>
            )}
          </div>
        </div>

        <div className="card">
          <h2>Rechnungen</h2>
          <div className="list">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="list-item">
                <strong>{invoice.invoiceNumber}</strong>
                <div>{invoice.subject}</div>
                <div>Status: {invoice.status}</div>
                <div>Gesamt: {(invoice.totalCents / 100).toFixed(2)} €</div>
                <Link href={`/invoices/${invoice.id}`}>Öffnen</Link>
              </div>
            ))}
            {invoices.length === 0 && (
              <div className="muted">Keine Rechnungen vorhanden.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}