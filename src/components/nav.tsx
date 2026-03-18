import Link from "next/link";

const links = [
  { href: "/", label: "Start" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clients", label: "Kunden" },
  { href: "/catalog", label: "Preiskatalog" },
  { href: "/offers", label: "Angebote" },
  { href: "/offers/new", label: "Neues Angebot" },
  { href: "/licenses", label: "Lizenz" },
  { href: "/admin", label: "Admin" }
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