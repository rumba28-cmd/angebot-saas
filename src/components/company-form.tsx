"use client";

import { useEffect, useState } from "react";

type CompanyFormState = {
  companyName: string;
  ownerName: string;
  addressLine1: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  vatNumber: string;
  taxNumber: string;
  iban: string;
  bic: string;
  bankName: string;
  logoUrl: string;
  defaultFooter: string;
  legalText: string;
};

const EMPTY_FORM: CompanyFormState = {
  companyName: "",
  ownerName: "",
  addressLine1: "",
  postalCode: "",
  city: "",
  country: "Deutschland",
  phone: "",
  email: "",
  vatNumber: "",
  taxNumber: "",
  iban: "",
  bic: "",
  bankName: "",
  logoUrl: "",
  defaultFooter: "",
  legalText: ""
};

export function CompanyForm() {
  const [form, setForm] = useState<CompanyFormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch("/api/company");
      const data = await res.json();

      if (data) {
        setForm({
          companyName: data.companyName || "",
          ownerName: data.ownerName || "",
          addressLine1: data.addressLine1 || "",
          postalCode: data.postalCode || "",
          city: data.city || "",
          country: data.country || "Deutschland",
          phone: data.phone || "",
          email: data.email || "",
          vatNumber: data.vatNumber || "",
          taxNumber: data.taxNumber || "",
          iban: data.iban || "",
          bic: data.bic || "",
          bankName: data.bankName || "",
          logoUrl: data.logoUrl || "",
          defaultFooter: data.defaultFooter || "",
          legalText: data.legalText || ""
        });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);

      const res = await fetch("/api/company", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Fehler beim Speichern");
        return;
      }

      alert("Firmendaten gespeichert");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="card">Lade Firmendaten...</div>;
  }

  return (
    <form onSubmit={save} className="stack">
      <div className="card">
        <h1>Meine Firma</h1>
        <div className="muted">
          Diese Daten werden für Angebot und Rechnung verwendet.
        </div>
      </div>

      <div className="card">
        <h2>Firmendaten</h2>
        <div className="form">
          <input
            placeholder="Firmenname"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            required
          />
          <input
            placeholder="Inhaber / Ansprechpartner"
            value={form.ownerName}
            onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
          />
          <input
            placeholder="Straße / Hausnummer"
            value={form.addressLine1}
            onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
          />

          <div className="row">
            <input
              placeholder="PLZ"
              value={form.postalCode}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
            />
            <input
              placeholder="Ort"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <input
              placeholder="Land"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </div>

          <div className="row">
            <input
              placeholder="Telefon"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              placeholder="E-Mail"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <input
            placeholder="Logo URL (optional)"
            value={form.logoUrl}
            onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
          />
        </div>
      </div>

      <div className="card">
        <h2>Steuerdaten</h2>
        <div className="form">
          <input
            placeholder="USt-IdNr. (optional)"
            value={form.vatNumber}
            onChange={(e) => setForm({ ...form, vatNumber: e.target.value })}
          />
          <input
            placeholder="Steuernummer"
            value={form.taxNumber}
            onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
          />
        </div>
      </div>

      <div className="card">
        <h2>Bankverbindung</h2>
        <div className="form">
          <input
            placeholder="Bankname"
            value={form.bankName}
            onChange={(e) => setForm({ ...form, bankName: e.target.value })}
          />
          <input
            placeholder="IBAN"
            value={form.iban}
            onChange={(e) => setForm({ ...form, iban: e.target.value })}
          />
          <input
            placeholder="BIC"
            value={form.bic}
            onChange={(e) => setForm({ ...form, bic: e.target.value })}
          />
        </div>
      </div>

      <div className="card">
        <h2>Standardtexte</h2>
        <div className="form">
          <textarea
            rows={4}
            placeholder="Standard-Footer"
            value={form.defaultFooter}
            onChange={(e) => setForm({ ...form, defaultFooter: e.target.value })}
          />
          <textarea
            rows={5}
            placeholder="Rechtlicher / zusätzlicher Hinweistext"
            value={form.legalText}
            onChange={(e) => setForm({ ...form, legalText: e.target.value })}
          />
        </div>
      </div>

      <div className="card">
        <div className="row">
          <button type="submit" disabled={saving}>
            {saving ? "Speichern..." : "Firmendaten speichern"}
          </button>
        </div>
      </div>
    </form>
  );
}