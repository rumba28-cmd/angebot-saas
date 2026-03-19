import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";

export default async function ClientsPage() {
  const user = await getDemoUser();

  const clients = await prisma.client.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="stack">
      <div className="card">
        <div className="toolbar">
          <div>
            <h1>Kunden</h1>
            <div className="muted">
              Gemeinsame Kundenbasis für Angebot und Rechnung
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Neuen Kunden anlegen</h2>

          <form action="/api/clients" method="post" className="form">
            <input name="name" placeholder="Name / Firma" required />
            <input name="email" placeholder="E-Mail" />
            <input name="phone" placeholder="Telefon" />
            <input name="addressLine1" placeholder="Straße / Hausnummer" />

            <div className="row">
              <input name="postalCode" placeholder="PLZ" />
              <input name="city" placeholder="Ort" />
            </div>

            <input name="projectLocation" placeholder="Projektort" />
            <textarea name="notes" rows={4} placeholder="Notizen" />

            <button type="submit">Kunde speichern</button>
          </form>
        </div>

        <div className="card">
          <h2>Kundenliste</h2>

          <div className="list">
            {clients.map((client) => (
              <div key={client.id} className="list-item">
                <strong>{client.name}</strong>
                <div>{client.email || "—"}</div>
                <div>{client.phone || "—"}</div>
                <div>{client.projectLocation || "—"}</div>

                <div className="row" style={{ marginTop: 10 }}>
                  <Link href={`/clients/${client.id}`}>Öffnen</Link>
                  <Link href="/offers/new">Angebot erstellen</Link>
                  <Link href="/invoices/new">Rechnung erstellen</Link>
                </div>
              </div>
            ))}

            {clients.length === 0 && (
              <div className="muted">Noch keine Kunden vorhanden.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}