"use client";

import { useEffect, useState } from "react";

type Client = {
  id: string;
  name: string;
  email?: string;
  city?: string;
  projectLocation?: string;
};

export function ClientsManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    city: "",
    projectLocation: ""
  });

  async function load() {
    const res = await fetch("/api/clients");
    const data = await res.json();
    setClients(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setForm({ name: "", email: "", city: "", projectLocation: "" });
    load();
  }

  return (
    <div className="grid-2">
      <div className="card">
        <h2>Neuer Kunde</h2>
        <form onSubmit={submit} className="form">
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="E-Mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Stadt" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input placeholder="Projektort" value={form.projectLocation} onChange={(e) => setForm({ ...form, projectLocation: e.target.value })} />
          <button type="submit">Speichern</button>
        </form>
      </div>

      <div className="card">
        <h2>Kundenliste</h2>
        <div className="list">
          {clients.map((c) => (
            <div key={c.id} className="list-item">
              <strong>{c.name}</strong>
              <div>{c.email || "—"}</div>
              <div>{c.city || "—"}</div>
              <div>Projekt: {c.projectLocation || "—"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}