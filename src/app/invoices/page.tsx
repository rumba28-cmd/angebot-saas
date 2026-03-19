import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";

export default async function InvoicesPage({
  searchParams
}: {
  searchParams?: { status?: string };
}) {
  const user = await getDemoUser();
  const status = searchParams?.status || "";

  const invoices = await prisma.invoice.findMany({
    where: {
      userId: user.id,
      ...(status ? { status } : {})
    },
    include: { client: true, sourceOffer: true },
    orderBy: { createdAt: "desc" }
  });

  const statuses = ["", "DRAFT", "SENT", "PARTIAL", "PAID", "OVERDUE", "CANCELED"];

  return (
    <div className="stack">
      <div className="card">
        <div className="toolbar">
          <h1>Rechnungen</h1>
          <div className="row">
            {statuses.map((s) => (
              <Link
                key={s || "ALL"}
                className={status === s ? "button-link small" : "secondary-btn small"}
                href={s ? `/invoices?status=${s}` : "/invoices"}
              >
                {s || "Alle"}
              </Link>
            ))}
            <Link className="button-link" href="/invoices/new">
              Neue Rechnung
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="list">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="list-item">
              <strong>{invoice.invoiceNumber}</strong>
              <div>{invoice.subject}</div>
              <div>Kunde: {invoice.client.name}</div>
              <div>Status: {invoice.status}</div>
              {invoice.sourceOffer && <div>Quelle: {invoice.sourceOffer.offerNumber}</div>}
              <div>Gesamt: {(invoice.totalCents / 100).toFixed(2)} €</div>
              <Link href={`/invoices/${invoice.id}`}>Öffnen</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}