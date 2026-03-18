"use client";

import { useState } from "react";

export function ActivateKeyForm() {
  const [key, setKey] = useState("");
  const [result, setResult] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/licenses/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key })
    });

    const data = await res.json();
    if (!res.ok) {
      setResult(data.error || "Fehler");
      return;
    }
    setResult(`Aktiviert: ${data.plan}, gültig bis ${new Date(data.endsAt).toLocaleDateString("de-DE")}`);
    setKey("");
  }

  return (
    <div className="card">
      <h2>Lizenzschlüssel aktivieren</h2>
      <form onSubmit={submit} className="form">
        <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="ANGB-XXXX-XXXX-XXXX-XXXX" required />
        <button type="submit">Aktivieren</button>
      </form>
      {result && <div className="info">{result}</div>}
    </div>
  );
}