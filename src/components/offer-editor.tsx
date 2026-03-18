"use client";

import { useEffect, useState } from "react";

type OfferItem = {
  id: string;
  title: string;
  description?: string;
  quantity: number | null;
  unit: string;
  unitPriceCents: number;
  totalCents: number;
  needsConfirmation: boolean;
};

type Offer = {
  id: string;
  offerNumber: string;
  title: string;
  subject: string;
  introText?: string;
  footerText?: string;
  paymentTerms?: string;
  notes?: string;
  subtotalCents: number;
  vatAmountCents: number;
  totalCents: number;
  items: OfferItem[];
  client: { name: string };
};

export function OfferEditor({ offerId }: { offerId: string }) {
  const [offer, setOffer] = useState<Offer | null>(null);

  async function load() {
    const res = await fetch(`/api/offers/${offerId}`);
    const data = await res.json();
    setOffer(data);
  }

  useEffect(() => {
    load();
  }, [offerId]);

  async function save() {
    if (!offer) return;
    const res = await fetch(`/api/offers/${offerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(offer)
    });

    const data = await res.json();
    setOffer(data);
    alert("Gespeichert");
  }

  if (!offer) return <div className="card">Laden...</div>;

  return (
    <div className="grid-2">
      <div className="card">
        <h2>Bearbeiten</h2>
        <div className="form">
          <input value={offer.title} onChange={(e) => setOffer({ ...offer, title: e.target.value })} />
          <input value={offer.subject} onChange={(e) => setOffer({ ...offer, subject: e.target.value })} />
          <textarea
            rows={4}
            value={offer.introText || ""}
            onChange={(e) => setOffer({ ...offer, introText: e.target.value })}
          />
          <textarea
            rows={3}
            placeholder="Zahlungsbedingungen"
            value={offer.paymentTerms || ""}
            onChange={(e) => setOffer({ ...offer, paymentTerms: e.target.value })}
          />
          <textarea
            rows={3}
            placeholder="Hinweise"
            value={offer.notes || ""}
            onChange={(e) => setOffer({ ...offer, notes: e.target.value })}
          />
          <textarea
            rows={3}
            placeholder="Footer"
            value={offer.footerText || ""}
            onChange={(e) => setOffer({ ...offer, footerText: e.target.value })}
          />
        </div>

        <h3>Positionen</h3>
        <div className="list">
          {offer.items.map((item, index) => (
            <div key={item.id} className="list-item">
              <input
                value={item.title}
                onChange={(e) => {
                  const items = [...offer.items];
                  items[index].title = e.target.value;
                  setOffer({ ...offer, items });
                }}
              />
              <textarea
                value={item.description || ""}
                onChange={(e) => {
                  const items = [...offer.items];
                  items[index].description = e.target.value;
                  setOffer({ ...offer, items });
                }}
              />
              <div className="row">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Menge"
                  value={item.quantity ?? ""}
                  onChange={(e) => {
                    const items = [...offer.items];
                    items[index].quantity = e.target.value ? Number(e.target.value) : null;
                    setOffer({ ...offer, items });
                  }}
                />
                <select
                  value={item.unit}
                  onChange={(e) => {
                    const items = [...offer.items];
                    items[index].unit = e.target.value;
                    setOffer({ ...offer, items });
                  }}
                >
                  <option value="M2">M2</option>
                  <option value="METER">METER</option>
                  <option value="HOUR">HOUR</option>
                  <option value="FIXED">FIXED</option>
                  <option value="ITEM">ITEM</option>
                </select>
                <input
                  type="number"
                  placeholder="Preis in Cent"
                  value={item.unitPriceCents}
                  onChange={(e) => {
                    const items = [...offer.items];
                    items[index].unitPriceCents = Number(e.target.value);
                    setOffer({ ...offer, items });
                  }}
                />
              </div>
              {item.needsConfirmation && <div className="warning">Menge muss bestätigt werden</div>}
            </div>
          ))}
        </div>

        <div className="row">
          <button onClick={save}>Speichern</button>
          <a className="button-link" href={`/api/offers/${offerId}/pdf`} target="_blank">
            PDF herunterladen
          </a>
        </div>
      </div>

      <div className="card">
        <h2>Vorschau</h2>
        <p><strong>{offer.subject}</strong></p>
        <p>{offer.introText}</p>
        <p><strong>Kunde:</strong> {offer.client.name}</p>

        <table className="table">
          <thead>
            <tr>
              <th>Leistung</th>
              <th>Menge</th>
              <th>Preis</th>
              <th>Gesamt</th>
            </tr>
          </thead>
          <tbody>
            {offer.items.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.quantity ?? "prüfen"}</td>
                <td>{(item.unitPriceCents / 100).toFixed(2)} €</td>
                <td>{(item.totalCents / 100).toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="summary">
          <div>Zwischensumme: {(offer.subtotalCents / 100).toFixed(2)} €</div>
          <div>MwSt.: {(offer.vatAmountCents / 100).toFixed(2)} €</div>
          <div><strong>Gesamt: {(offer.totalCents / 100).toFixed(2)} €</strong></div>
        </div>
      </div>
    </div>
  );
}