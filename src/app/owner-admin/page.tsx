import { AdminKeyGenerator } from "@/components/admin-key-generator";
import { requireOwnerAdmin } from "@/lib/admin-access";

export default async function OwnerAdminPage() {
  await requireOwnerAdmin();

  return (
    <div className="stack">
      <div className="card">
        <h1>Owner Admin</h1>
        <div className="muted">
          Dieser Bereich ist nur für den Eigentümer/Admin sichtbar.
        </div>
      </div>

      <AdminKeyGenerator />
    </div>
  );
}