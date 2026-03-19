"use client";

import { useState } from "react";

export function InvoiceFromOffer({ offerId }: { offerId: string }) {
  const [type, setType] = useState("STANDARD");
  const [percent, setPercent] = useState("50");
  const [loading, setLoading] = useState(false);

  async function createInvoice() {
    try {
      setLoading(true);

      const res = await fetch("/api/invoices/from-offer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          offerId,
          type,
          percent: Number(percent)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Fehler");
        return;
      }

      window.location.href = `/invoices/${data.id}`;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1>Rechnung aus Angebot erstellen</h1>

      <div className="form">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="STANDARD">Standardrechnung</option>
          <option value="ABSCHLAG">Abschlagsrechnung</option>
          <option value="SCHLUSS">Schlussrechnung</option>
        </select>

        {type === "ABSCHLAG" && (
          <input
            type="number"
            min="1"
            max="100"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            placeholder="Prozent"
          />
        )}

        <button onClick={createInvoice} disabled={loading}>
          {loading ? "Erstelle..." : "Rechnung erstellen"}
        </button>
      </div>
    </div>
  );
}