"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Client = { id: string; name: string };

export function OfferGenerator() {
  const router = useRouter();
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
      });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, text })
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Fehler");
      return;
    }

    const data = await res.json();
    router.push(`/offers/${data.id}`);
  }

  return (
    <div className="card">
      <h2>Angebot aus Kunden-E-Mail erzeugen</h2>
      <form onSubmit={submit} className="form">
        <select value={clientId} onChange={(e) => setClientId(e.target.value)} required>
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