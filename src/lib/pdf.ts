import PDFDocument from "pdfkit";
import { unitLabel } from "./matching";

function euro(cents: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  }).format(cents / 100);
}

export async function buildOfferPdf(offer: any) {
  return new Promise<Buffer>((resolve) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    const company = offer.companyProfile;
    const client = offer.client;

    doc.fontSize(18).text("Angebot", { align: "right" });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(company?.companyName || "Firma");
    if (company?.addressLine1) doc.text(company.addressLine1);
    if (company?.postalCode || company?.city) doc.text(`${company?.postalCode || ""} ${company?.city || ""}`);
    if (company?.email) doc.text(company.email);
    if (company?.phone) doc.text(company.phone);

    doc.moveDown();
    doc.text("An:");
    doc.text(client.name);
    if (client.addressLine1) doc.text(client.addressLine1);
    if (client.postalCode || client.city) doc.text(`${client.postalCode || ""} ${client.city || ""}`);

    doc.moveDown();
    doc.text(`Angebotsnummer: ${offer.offerNumber}`);
    doc.text(`Datum: ${new Date(offer.createdAt).toLocaleDateString("de-DE")}`);
    if (offer.validUntil) {
      doc.text(`Gültig bis: ${new Date(offer.validUntil).toLocaleDateString("de-DE")}`);
    }

    doc.moveDown();
    doc.fontSize(13).text(offer.subject || "Angebot");
    doc.moveDown(0.5);
    doc.fontSize(10).text(
      offer.introText ||
        "Vielen Dank für Ihre Anfrage. Hiermit unterbreiten wir Ihnen folgendes Angebot."
    );

    doc.moveDown();

    let y = doc.y;
    doc.fontSize(10).text("Pos.", 50, y);
    doc.text("Leistung", 90, y);
    doc.text("Menge", 330, y);
    doc.text("EP", 400, y);
    doc.text("Gesamt", 480, y);
    doc.moveTo(50, y + 15).lineTo(545, y + 15).stroke();

    y += 25;

    for (const item of offer.items) {
      const qtyText = item.quantity ? `${item.quantity} ${unitLabel(item.unit)}` : "bitte prüfen";
      doc.text(String(item.position), 50, y);
      doc.text(item.title, 90, y, { width: 220 });
      doc.text(qtyText, 330, y, { width: 60 });
      doc.text(euro(item.unitPriceCents), 400, y, { width: 60 });
      doc.text(euro(item.totalCents), 480, y, { width: 60 });
      y += 35;
      if (item.description) {
        doc.fontSize(8).fillColor("gray").text(item.description, 90, y - 8, { width: 220 });
        doc.fillColor("black").fontSize(10);
      }
    }

    doc.moveDown(2);
    doc.text(`Zwischensumme: ${euro(offer.subtotalCents)}`, { align: "right" });
    doc.text(`MwSt. (${offer.vatPercent}%): ${euro(offer.vatAmountCents)}`, { align: "right" });
    doc.fontSize(12).text(`Gesamt: ${euro(offer.totalCents)}`, { align: "right" });

    doc.moveDown();
    if (offer.notes) doc.fontSize(10).text(`Hinweise: ${offer.notes}`);
    if (offer.paymentTerms) doc.fontSize(10).text(`Zahlungsbedingungen: ${offer.paymentTerms}`);
    if (offer.footerText) {
      doc.moveDown();
      doc.fontSize(10).text(offer.footerText);
    }

    doc.end();
  });
}