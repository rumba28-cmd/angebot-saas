"use client";

import { useEffect, useState } from "react";

type Client = { id: string; name: string };

async function safeReadJson(res: Response) {
  const text = await res.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export function OfferGenerator() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [text, setText] = useState(`Guten Tag,
wir möchten das Wohnzimmer und Schlafzimmer streichen lassen.
Im Flur muss der alte Boden entfernt und neues Laminat verlegt werden.
Bitte senden Sie uns ein Angebot.
Mit freundlichen Grüßen`);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => {
        setClients(data);
        if (data[0]) setClientId(data[0].id);
      })
      .catch(() => {
        alert("Kunden konnten nicht geladen werden");
      });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, text })
      });

      const data = await safeReadJson(res);

      if (!res.ok) {
        const msg =
          data?.error ||
          data?.message ||
          "Serverfehler beim Erstellen des Angebots";
        alert(msg);
        console.error("Offer create error:", data);
        return;
      }

      if (!data?.id) {
        alert("Keine Angebots-ID zurückgegeben.");
        console.error("Unexpected response:", data);
        return;
      }

      window.location.href = `/offers/${data.id}`;
    } catch (error) {
      console.error(error);
      alert("Netzwerk- oder Serverfehler");
    }
  }

  return (
    <div className="card">
      <h2>Angebot aus Kunden-E-Mail erzeugen</h2>
      <form onSubmit={submit} className="form">
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          required
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <textarea
          rows={12}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Kundentext hier einfügen"
          required
        />

        <button type="submit">Angebot erstellen</button>
      </form>
    </div>
  );
}