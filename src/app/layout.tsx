import "./globals.css";
import { Nav } from "@/components/nav";

export const metadata = {
  title: "Angebot SaaS",
  description: "Angebote für Bauunternehmen"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Nav />
        <main className="container page">{children}</main>
      </body>
    </html>
  );
}