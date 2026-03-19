import Link from "next/link";
import { OfferEditor } from "@/components/offer-editor";

export default function OfferPage({ params }: { params: { id: string } }) {
  return (
    <div className="stack">
      <div className="card">
        <div className="toolbar">
          <h2>Aktionen</h2>
          <div className="row">
            <Link className="button-link" href={`/invoices/from-offer/${params.id}`}>
              Rechnung aus Angebot
            </Link>
          </div>
        </div>
      </div>

      <OfferEditor offerId={params.id} />
    </div>
  );
}