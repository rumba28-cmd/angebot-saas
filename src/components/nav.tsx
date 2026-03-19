import Link from "next/link";

const links = [
  { href: "/", label: "Start" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clients", label: "Kunden" },
  { href: "/company", label: "Firma" },
  { href: "/catalog", label: "Preiskatalog" },
  { href: "/offers", label: "Angebote" },
  { href: "/invoices", label: "Rechnungen" },
  { href: "/licenses", label: "Lizenz" }
];

export function Nav() {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <div className="brand">Angebot SaaS</div>

        <div className="nav-links">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}