"use client";

import { useEffect, useMemo, useState } from "react";

type OfferItem = {
  id: string;
  title: string;
  description?: string | null;
  quantity: number | null;
  unit: string;
  unitPriceCents: number;
  totalCents: number;
  vatPercent: number;
  needsConfirmation: boolean;
};

type Offer = {
  id: string;
  offerNumber: string;
  title: string;
  subject: string;
  sourceText?: string | null;
  introText?: string | null;
  footerText?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
  validUntil?: string | null;
  currency: string;
  subtotalCents: number;
  vatPercent: number;
  vatAmountCents: number;
  totalCents: number;
  status: string;
  items: OfferItem[];
  client: {
    name: string;
    email?: string | null;
    addressLine1?: string | null;
    postalCode?: string | null;
    city?: string | null;
    projectLocation?: string | null;
  } | null;
  companyProfile?: {
    companyName?: string | null;
    ownerName?: string | null;
    addressLine1?: string | null;
    postalCode?: string | null;
    city?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  }).format(cents / 100);
}

function formatUnit(unit: string) {
  if (unit === "M2") return "m²";
  if (unit === "METER") return "m";
  if (unit === "HOUR") return "Std.";
  if (unit === "FIXED") return "pauschal";
  if (unit === "ITEM") return "Stk.";
  return unit;
}

function toDateInput(value?: string | null) {
  if (!value) return "";
  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

function normalizeOffer(data: any): Offer {
  return {
    id: data?.id || "",
    offerNumber: data?.offerNumber || "",
    title: data?.title || "Angebot",
    subject: data?.subject || "",
    sourceText: data?.sourceText || "",
    introText: data?.introText || "",
    footerText: data?.footerText || "",
    paymentTerms: data?.paymentTerms || "",
    notes: data?.notes || "",
    validUntil: data?.validUntil || null,
    currency: data?.currency || "EUR",
    subtotalCents: Number(data?.subtotalCents || 0),
    vatPercent: Number(data?.vatPercent || 19),
    vatAmountCents: Number(data?.vatAmountCents || 0),
    totalCents: Number(data?.totalCents || 0),
    status: data?.status || "DRAFT",
    items: Array.isArray(data?.items)
      ? data.items.map((item: any) => ({
          id: item?.id || String(Math.random()),
          title: item?.title || "",
          description: item?.description || "",
          quantity:
            item?.quantity === null || item?.quantity === undefined
              ? null
              : Number(item.quantity),
          unit: item?.unit || "M2",
          unitPriceCents: Number(item?.unitPriceCents || 0),
          totalCents: Number(item?.totalCents || 0),
          vatPercent: Number(item?.vatPercent || 19),
          needsConfirmation: Boolean(item?.needsConfirmation)
        }))
      : [],
    client: data?.client
      ? {
          name: data.client.name || "",
          email: data.client.email || "",
          addressLine1: data.client.addressLine1 || "",
          postalCode: data.client.postalCode || "",
          city: data.client.city || "",
          projectLocation: data.client.projectLocation || ""
        }
      : null,
    companyProfile: data?.companyProfile
      ? {
          companyName: data.companyProfile.companyName || "",
          ownerName: data.companyProfile.ownerName || "",
          addressLine1: data.companyProfile.addressLine1 || "",
          postalCode: data.companyProfile.postalCode || "",
          city: data.companyProfile.city || "",
          phone: data.companyProfile.phone || "",
          email: data.companyProfile.email || ""
        }
      : null
  };
}

export function OfferEditor({ offerId }: { offerId: string }) {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/offers/${offerId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Fehler beim Laden");
        return;
      }

      setOffer(normalizeOffer(data));
    } catch (e) {
      console.error(e);
      setError("Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [offerId]);

  const safeItems = offer?.items ?? [];

  const previewTotals = useMemo(() => {
    const subtotalCents = safeItems.reduce((sum, item) => {
      const qty =
        item.quantity === null || item.quantity === undefined || Number.isNaN(Number(item.quantity))
          ? null
          : Number(item.quantity);

      const total =
        qty !== null
          ? Math.round(qty * item.unitPriceCents)
          : item.unit === "FIXED" || item.unit === "ITEM"
          ? item.unitPriceCents
          : 0;

      return sum + total;
    }, 0);

    const vatPercent = Number(offer?.vatPercent || 19);
    const vatAmountCents = Math.round(subtotalCents * (vatPercent / 100));
    const totalCents = subtotalCents + vatAmountCents;

    return { subtotalCents, vatAmountCents, totalCents };
  }, [safeItems, offer?.vatPercent]);

  function updateItem(index: number, patch: Partial<OfferItem>) {
    if (!offer) return;

    const items = [...offer.items];
    const current = items[index];
    if (!current) return;

    const next = { ...current, ...patch };

    const qty =
      next.quantity === null || next.quantity === undefined || next.quantity === ("" as any)
        ? null
        : Number(next.quantity);

    const totalCents =
      qty !== null
        ? Math.round(qty * Number(next.unitPriceCents))
        : next.unit === "FIXED" || next.unit === "ITEM"
        ? Number(next.unitPriceCents)
        : 0;

    next.quantity = qty;
    next.totalCents = totalCents;
    next.needsConfirmation =
      qty === null && next.unit !== "FIXED" && next.unit !== "ITEM";

    items[index] = next;
    setOffer({ ...offer, items });
  }

  async function save() {
    if (!offer) return;

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...offer,
        validUntil: offer.validUntil || null,
        items: offer.items.map((item) => ({
          ...item,
          quantity:
            item.quantity === null || item.quantity === undefined
              ? null
              : Number(item.quantity),
          unitPriceCents: Number(item.unitPriceCents)
        }))
      };

      const res = await fetch(`/api/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Fehler beim Speichern");
        return;
      }

      setOffer(normalizeOffer(data));
      alert("Angebot gespeichert");
    } catch (e) {
      console.error(e);
      setError("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  async function createInvoiceFromOffer() {
    try {
      setCreatingInvoice(true);

      const res = await fetch("/api/invoices/from-offer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          offerId,
          type: "STANDARD"
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Fehler beim Erstellen der Rechnung");
        return;
      }

      window.location.href = `/invoices/${data.id}`;
    } catch (e) {
      console.error(e);
      alert("Fehler beim Erstellen der Rechnung");
    } finally {
      setCreatingInvoice(false);
    }
  }

  if (loading) return <div className="card">Lade Angebot...</div>;
  if (error && !offer) return <div className="card error-box">{error}</div>;
  if (!offer) return <div className="card">Angebot nicht gefunden.</div>;

  return (
    <div className="offer-editor-page">
      <div className="offer-editor-grid">
        <div className="stack">
          <div className="card">
            <div className="toolbar">
              <div>
                <h1>Angebot bearbeiten</h1>
                <div className="muted">
                  {offer.offerNumber || "—"} · Status: {offer.status}
                </div>
              </div>

              <div className="row">
                <button onClick={save} disabled={saving}>
                  {saving ? "Speichern..." : "Speichern"}
                </button>

                <a
                  className="button-link"
                  href={`/api/offers/${offerId}/pdf`}
                  target="_blank"
                >
                  PDF herunterladen
                </a>

                <button onClick={createInvoiceFromOffer} disabled={creatingInvoice}>
                  {creatingInvoice ? "Erstelle Rechnung..." : "Rechnung erstellen"}
                </button>
              </div>
            </div>

            {error && <div className="error-box">{error}</div>}

            <div className="form">
              <input
                value={offer.title}
                onChange={(e) => setOffer({ ...offer, title: e.target.value })}
                placeholder="Titel"
              />

              <input
                value={offer.subject}
                onChange={(e) => setOffer({ ...offer, subject: e.target.value })}
                placeholder="Betreff"
              />

              <input
                type="date"
                value={toDateInput(offer.validUntil)}
                onChange={(e) => setOffer({ ...offer, validUntil: e.target.value || null })}
              />

              <textarea
                rows={5}
                value={offer.introText || ""}
                onChange={(e) => setOffer({ ...offer, introText: e.target.value })}
                placeholder="Einleitung"
              />

              <textarea
                rows={3}
                value={offer.paymentTerms || ""}
                onChange={(e) => setOffer({ ...offer, paymentTerms: e.target.value })}
                placeholder="Zahlungsbedingungen"
              />

              <textarea
                rows={3}
                value={offer.notes || ""}
                onChange={(e) => setOffer({ ...offer, notes: e.target.value })}
                placeholder="Hinweise"
              />

              <textarea
                rows={3}
                value={offer.footerText || ""}
                onChange={(e) => setOffer({ ...offer, footerText: e.target.value })}
                placeholder="Footer"
              />
            </div>
          </div>

          <div className="card">
            <h2>Positionen</h2>

            {safeItems.length === 0 ? (
              <div className="muted">Keine Positionen vorhanden.</div>
            ) : (
              <div className="list">
                {safeItems.map((item, index) => (
                  <div key={item.id} className="offer-item-card">
                    <div className="offer-item-head">
                      <strong>Pos. {index + 1}</strong>
                      {item.needsConfirmation && (
                        <span className="badge warning-badge">Menge bestätigen</span>
                      )}
                    </div>

                    <div className="form">
                      <input
                        value={item.title}
                        onChange={(e) => updateItem(index, { title: e.target.value })}
                        placeholder="Leistung"
                      />

                      <textarea
                        rows={3}
                        value={item.description || ""}
                        onChange={(e) => updateItem(index, { description: e.target.value })}
                        placeholder="Beschreibung"
                      />

                      <div className="offer-item-row">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Menge"
                          value={item.quantity ?? ""}
                          onChange={(e) =>
                            updateItem(index, {
                              quantity: e.target.value === "" ? null : Number(e.target.value)
                            })
                          }
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
                          placeholder="Einzelpreis in Cent"
                          value={item.unitPriceCents}
                          onChange={(e) =>
                            updateItem(index, { unitPriceCents: Number(e.target.value) })
                          }
                        />
                      </div>

                      <div className="offer-item-summary">
                        <span>Einheit: {formatUnit(item.unit)}</span>
                        <span>Einzelpreis: {formatMoney(item.unitPriceCents)}</span>
                        <span>Gesamt: {formatMoney(item.totalCents)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2>Kundenanfrage</h2>
            <textarea
              rows={8}
              value={offer.sourceText || ""}
              onChange={(e) => setOffer({ ...offer, sourceText: e.target.value })}
              placeholder="Quelltext des Kunden"
            />
          </div>
        </div>

        <div className="stack">
          <div className="card preview-card">
            <h2>Vorschau</h2>

            <div className="preview-document">
              <div className="preview-top">
                <div>
                  <strong>{offer.companyProfile?.companyName || "Ihre Firma"}</strong>
                  <div>{offer.companyProfile?.addressLine1 || ""}</div>
                  <div>
                    {[
                      offer.companyProfile?.postalCode,
                      offer.companyProfile?.city
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </div>
                  <div>{offer.companyProfile?.email || ""}</div>
                  <div>{offer.companyProfile?.phone || ""}</div>
                </div>

                <div className="preview-meta">
                  <div>
                    <strong>Angebot</strong>
                  </div>
                  <div>{offer.offerNumber || "—"}</div>
                  {offer.validUntil && (
                    <div>
                      Gültig bis:{" "}
                      {new Date(offer.validUntil).toLocaleDateString("de-DE")}
                    </div>
                  )}
                </div>
              </div>

              <div className="preview-client">
                <div>
                  <strong>An:</strong>
                </div>
                <div>{offer.client?.name || ""}</div>
                <div>{offer.client?.addressLine1 || ""}</div>
                <div>
                  {[offer.client?.postalCode, offer.client?.city]
                    .filter(Boolean)
                    .join(" ")}
                </div>
                {offer.client?.projectLocation && (
                  <div>Projektort: {offer.client.projectLocation}</div>
                )}
              </div>

              <div className="preview-subject">
                <strong>{offer.subject}</strong>
              </div>

              <div className="preview-intro">
                {(offer.introText || "").split("\n").map((line, i) => (
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
                  {safeItems.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div>
                          <strong>{item.title}</strong>
                        </div>
                        {item.description && (
                          <div className="muted small">{item.description}</div>
                        )}
                      </td>
                      <td>
                        {item.quantity !== null
                          ? `${item.quantity} ${formatUnit(item.unit)}`
                          : "prüfen"}
                      </td>
                      <td>{formatMoney(item.unitPriceCents)}</td>
                      <td>{formatMoney(item.totalCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="preview-totals">
                <div>Zwischensumme: {formatMoney(previewTotals.subtotalCents)}</div>
                <div>
                  MwSt. ({offer.vatPercent}%): {formatMoney(previewTotals.vatAmountCents)}
                </div>
                <div className="preview-total-main">
                  Gesamt: {formatMoney(previewTotals.totalCents)}
                </div>
              </div>

              {offer.notes && (
                <div className="preview-block">
                  <strong>Hinweise</strong>
                  <div>{offer.notes}</div>
                </div>
              )}

              {offer.paymentTerms && (
                <div className="preview-block">
                  <strong>Zahlungsbedingungen</strong>
                  <div>{offer.paymentTerms}</div>
                </div>
              )}

              {offer.footerText && (
                <div className="preview-block">
                  {(offer.footerText || "").split("\n").map((line, i) => (
                    <div key={i}>{line || "\u00A0"}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}