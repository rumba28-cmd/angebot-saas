import { getDemoUser } from "@/lib/demo-user";
import { getLicenseUsageInfo } from "@/lib/access";
import { ActivateKeyForm } from "@/components/activate-key-form";

export default async function LicensesPage() {
  const user = await getDemoUser();
  const info = await getLicenseUsageInfo(user.id);

  return (
    <div className="stack">
      <div className="card">
        <h1>Lizenz & Zugriff</h1>
        <div className="muted">
          Derselbe Login kann gleichzeitig auf Computer und Telefon verwendet werden.
        </div>
      </div>

      <div className="card">
        <h2>Aktive Lizenz</h2>

        {info.active ? (
          <div className="list">
            <div className="list-item">
              <strong>{info.planName}</strong>
              <div>Benutzer / Seats: {info.seatLimit}</div>
              <div>
                Gleichzeitige Nutzung auf Handy + Computer:{" "}
                {info.allowSameUserMultiDevice ? "Ja" : "Nein"}
              </div>
              <div>
                Gültig bis:{" "}
                {info.endsAt
                  ? new Date(info.endsAt).toLocaleDateString("de-DE")
                  : "—"}
              </div>
            </div>
          </div>
        ) : (
          <div className="muted">Keine aktive Lizenz vorhanden.</div>
        )}
      </div>

      <div className="card">
        <h2>Modelle</h2>
        <div className="list">
          <div className="list-item">
            <strong>1 Benutzer</strong>
            <div>Für Solo-Handwerker.</div>
            <div>Ein Login darf gleichzeitig am Handy und am Computer genutzt werden.</div>
          </div>

          <div className="list-item">
            <strong>3 Benutzer</strong>
            <div>Für kleine Teams.</div>
            <div>Bis zu 3 Benutzer mit gemeinsamer Kunden- und Leistungsdatenbank.</div>
          </div>
        </div>
      </div>

      <ActivateKeyForm />
    </div>
  );
}