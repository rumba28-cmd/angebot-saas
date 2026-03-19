"use client";

import { useEffect, useState } from "react";

type Client = { id: string; name: string };
type ServiceItem = {
  id: string;
  title: string;
  description?: string | null;
  unit: string;
  unitPriceCents: number;
  vatPercent: number;
};

export function InvoiceGenerator() {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [clientId, setClientId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => {
        setClients(data);
        if (data[0]) setClientId(data[0].id);
      });

    fetch("/api/catalog/items?status=active&sort=category")
      .then((r) => r.json())
      .then((data) => {
        setServices(data);
        if (data[0]) setSelectedServiceId(data[0].id);
      });
  }, []);

  function addItem() {
    const service = services.find((s) => s.id === selectedServiceId);
    if (!service) return;

    const quantity =
      service.unit === "FIXED" || service.unit === "ITEM" ? 1 : null;

    const totalCents =
      quantity !== null
        ? quantity * service.unitPriceCents
        : service.unit === "FIXED"
        ? service.unitPriceCents
        : 0;

    setItems((prev) => [
      ...prev,
      {
        serviceItemId: service.id,
        title: service.title,
        description: service.description || "",
        quantity,
        unit: service.unit,
        unitPriceCents: service.unitPriceCents,
        totalCents,
        vatPercent: service.vatPercent
      }
    ]);
  }

  async function createInvoice() {
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        clientId,
        type: "STANDARD",
        subject: "Rechnung für erbrachte Leistungen",
        items
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Fehler");
      return;
    }

    window.location.href = `/invoices/${data.id}`;
  }

  return (
    <div className="grid-2">
      <div className="card">
        <h1>Neue Rechnung</h1>

        <div className="form">
          <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="row">
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({(s.unitPriceCents / 100).toFixed(2)} €)
                </option>
              ))}
            </select>

            <button type="button" onClick={addItem}>
              Leistung hinzufügen
            </button>
          </div>

          <button type="button" onClick={createInvoice}>
            Rechnung erstellen
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Positionen</h2>
        <div className="list">
          {items.map((item, i) => (
            <div key={i} className="list-item">
              <strong>{item.title}</strong>
              <div>{item.description}</div>
              <div>
                Menge: {item.quantity ?? "prüfen"} · Preis:{" "}
                {(item.unitPriceCents / 100).toFixed(2)} €
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}