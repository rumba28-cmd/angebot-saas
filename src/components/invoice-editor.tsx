"use client";

import { useEffect, useMemo, useState } from "react";

function euro(cents: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  }).format((cents || 0) / 100);
}

function unitLabel(unit: string) {
  if (unit === "M2") return "m²";
  if (unit === "METER") return "m";
  if (unit === "HOUR") return "Std.";
  if (unit === "FIXED") return "pauschal";
  if (unit === "ITEM") return "Stk.";
  return unit || "";
}

export function InvoiceEditor({ invoiceId }: { invoiceId: string }) {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  async function load() {
    const res = await fetch(`/api/invoices/${invoiceId}`);
    const data = await res.json();
    setInvoice(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [invoiceId]);

  const totals = useMemo(() => {
    const items = Array.isArray(invoice?.items) ? invoice.items : [];
    const subtotalCents = items.reduce((sum: number, item: any) => {
      const qty = item.quantity === null || item.quantity === undefined ? null : Number(item.quantity);
      const total =
        qty !== null
          ? Math.round(qty * Number(item.unitPriceCents || 0))
          : item.unit === "FIXED" || item.unit === "ITEM"
          ? Number(item.unitPriceCents || 0)
          : 0;
      return sum + total;
    }, 0);

    const vatPercent = Number(invoice?.vatPercent || 19);
    const vatAmountCents = Math.round(subtotalCents * (vatPercent / 100));
    const totalCents = subtotalCents + vatAmountCents;

    return { subtotalCents, vatAmountCents, totalCents };
  }, [invoice]);

  function updateItem(index: number, patch: any) {
    const items = [...invoice.items];
    const item = { ...items[index], ...patch };
    const qty = item.quantity === "" || item.quantity === null ? null : Number(item.quantity);
    item.quantity = qty;
    item.totalCents =
      qty !== null
        ? Math.round(qty * Number(item.unitPriceCents || 0))
        : item.unit === "FIXED" || item.unit === "ITEM"
        ? Number(item.unitPriceCents || 0)
        : 0;
    items[index] = item;
    setInvoice({ ...invoice, items });
  }

  async function save() {
    const res = await fetch(`/api/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoice)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Fehler beim Speichern");
      return;
    }

    setInvoice(data);
    alert("Rechnung gespeichert");
  }

  async function setStatus(status: string) {
    const res = await fetch(`/api/invoices/${invoiceId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Fehler beim Statuswechsel");
      return;
    }

    setInvoice({ ...invoice, status: data.status });
  }

  async function sendEmail() {
    const recipientEmail =
      invoice?.client?.email || window.prompt("Empfänger E-Mail eingeben");

    if (!recipientEmail) return;

    try {
      setSending(true);

      const res = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Fehler beim Senden");
        return;
      }

      alert("Rechnung wurde per E-Mail versendet");
      await load();
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div className="card">Lade Rechnung...</div>;
  if (!invoice) return <div className="card">Rechnung nicht gefunden.</div>;

  return (
    <div className="offer-editor-page">
      <div className="offer-editor-grid">
        <div className="stack">
          <div className="card">
            <div className="toolbar">
              <div>
                <h1>Rechnung bearbeiten</h1>
                <div className="muted">
                  {invoice.invoiceNumber} · Typ: {invoice.type} · Status: {invoice.status}
                </div>
              </div>

              <div className="row">
                <button onClick={save}>Speichern</button>

                <a
                  className="button-link"
                  href={`/api/invoices/${invoiceId}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                >
                  PDF herunterladen
                </a>

                <button onClick={sendEmail} disabled={sending}>
                  {sending ? "Senden..." : "Per E-Mail senden"}
                </button>
              </div>
            </div>

            <div className="row" style={{ marginTop: 12 }}>
              <button className="secondary-btn small" onClick={() => setStatus("DRAFT")}>DRAFT</button>
              <button className="secondary-btn small" onClick={() => setStatus("SENT")}>SENT</button>
              <button className="secondary-btn small" onClick={() => setStatus("PARTIAL")}>PARTIAL</button>
              <button className="secondary-btn small" onClick={() => setStatus("PAID")}>PAID</button>
              <button className="secondary-btn small" onClick={() => setStatus("OVERDUE")}>OVERDUE</button>
              <button className="danger-btn small" onClick={() => setStatus("CANCELED")}>CANCELED</button>
            </div>

            <div className="form" style={{ marginTop: 16 }}>
              <input
                value={invoice.subject || ""}
                onChange={(e) => setInvoice({ ...invoice, subject: e.target.value })}
                placeholder="Betreff"
              />

              <input
                type="date"
                value={invoice.issueDate ? new Date(invoice.issueDate).toISOString().split("T")[0] : ""}
                onChange={(e) => setInvoice({ ...invoice, issueDate: e.target.value })}
              />

              <input
                type="date"
                value={invoice.serviceDate ? new Date(invoice.serviceDate).toISOString().split("T")[0] : ""}
                onChange={(e) => setInvoice({ ...invoice, serviceDate: e.target.value })}
              />

              <input
                type="date"
                value={invoice.dueDate ? new Date(invoice.dueDate).toISOString().split("T")[0] : ""}
                onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
              />

              <textarea
                rows={4}
                value={invoice.introText || ""}
                onChange={(e) => setInvoice({ ...invoice, introText: e.target.value })}
                placeholder="Einleitung"
              />

              <textarea
                rows={3}
                value={invoice.paymentTerms || ""}
                onChange={(e) => setInvoice({ ...invoice, paymentTerms: e.target.value })}
                placeholder="Zahlungsbedingungen"
              />

              <textarea
                rows={3}
                value={invoice.notes || ""}
                onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                placeholder="Hinweise"
              />

              <textarea
                rows={3}
                value={invoice.footerText || ""}
                onChange={(e) => setInvoice({ ...invoice, footerText: e.target.value })}
                placeholder="Footer"
              />
            </div>
          </div>

          <div className="card">
            <h2>Positionen</h2>
            <div className="list">
              {(invoice.items || []).map((item: any, index: number) => (
                <div key={item.id} className="offer-item-card">
                  <div className="form">
                    <input
                      value={item.title}
                      onChange={(e) => updateItem(index, { title: e.target.value })}
                    />
                    <textarea
                      rows={2}
                      value={item.description || ""}
                      onChange={(e) => updateItem(index, { description: e.target.value })}
                    />
                    <div className="offer-item-row">
                      <input
                        type="number"
                        step="0.01"
                        value={item.quantity ?? ""}
                        onChange={(e) => updateItem(index, { quantity: e.target.value })}
                      />
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(index, { unit: e.target.value })}
                      >
                        <option value="M2">m²</option>
                        <option value="METER">m</option>
                        <option value="HOUR">Std.</option>
                        <option value="FIXED">Pauschal</option>
                        <option value="ITEM">Stk.</option>
                      </select>
                      <input
                        type="number"
                        value={item.unitPriceCents}
                        onChange={(e) => updateItem(index, { unitPriceCents: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="stack">
          <div className="card preview-card">
            <h2>Vorschau</h2>

            <div className="preview-document">
              <div className="preview-top">
                <div>
                  <strong>{invoice.companyProfile?.companyName || "Ihre Firma"}</strong>
                  <div>{invoice.companyProfile?.addressLine1 || ""}</div>
                  <div>
                    {[invoice.companyProfile?.postalCode, invoice.companyProfile?.city].filter(Boolean).join(" ")}
                  </div>
                  <div>{invoice.companyProfile?.email || ""}</div>
                </div>

                <div className="preview-meta">
                  <div><strong>Rechnung</strong></div>
                  <div>{invoice.invoiceNumber}</div>
                  <div>Status: {invoice.status}</div>
                </div>
              </div>

              <div className="preview-client">
                <div><strong>An:</strong></div>
                <div>{invoice.client?.name || ""}</div>
                <div>{invoice.client?.addressLine1 || ""}</div>
                <div>{[invoice.client?.postalCode, invoice.client?.city].filter(Boolean).join(" ")}</div>
              </div>

              <div className="preview-subject">
                <strong>{invoice.subject}</strong>
              </div>

              <div className="preview-intro">
                {(invoice.introText || "").split("\n").map((line: string, i: number) => (
                  <p key={i}>{line || "\u00A0"}</p>
                ))}
              </div>

              <table className="table">
                <thead>
                  <tr>
                    <th>Pos.</th>
                    <th>Leistung</th>
                    <th>Menge</th>
                    <th>EP</th>
                    <th>Gesamt</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.items || []).map((item: any, index: number) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.title}</td>
                      <td>{item.quantity !== null ? `${item.quantity} ${unitLabel(item.unit)}` : "prüfen"}</td>
                      <td>{euro(item.unitPriceCents)}</td>
                      <td>{euro(item.totalCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="preview-totals">
                <div>Zwischensumme: {euro(totals.subtotalCents)}</div>
                <div>MwSt. ({invoice.vatPercent || 19}%): {euro(totals.vatAmountCents)}</div>
                <div className="preview-total-main">Gesamt: {euro(totals.totalCents)}</div>
              </div>

              {invoice.paymentTerms && (
                <div className="preview-block">
                  <strong>Zahlungsbedingungen</strong>
                  <div>{invoice.paymentTerms}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}