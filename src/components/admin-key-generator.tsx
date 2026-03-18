"use client";

import { useEffect, useState } from "react";

type Plan = {
  id: string;
  code: string;
  name: string;
};

export function AdminKeyGenerator() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState("");
  const [count, setCount] = useState(1);
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => {
        setPlans(data);
        if (data[0]) setPlanId(data[0].id);
      });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/license-keys/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, count })
    });

    const data = await res.json();
    setKeys(data.keys?.map((k: any) => k.rawKey) || []);
  }

  return (
    <div className="card">
      <h2>Admin: Lizenzschlüssel erstellen</h2>
      <form onSubmit={submit} className="form">
        <select value={planId} onChange={(e) => setPlanId(e.target.value)}>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.code})
            </option>
          ))}
        </select>

        <input type="number" min="1" max="50" value={count} onChange={(e) => setCount(Number(e.target.value))} />
        <button type="submit">Schlüssel erstellen</button>
      </form>

      {keys.length > 0 && (
        <div className="list">
          {keys.map((k) => (
            <div key={k} className="list-item">
              <code>{k}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}