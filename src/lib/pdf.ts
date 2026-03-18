import PDFDocument from "pdfkit";

function euro(cents: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  }).format((cents || 0) / 100);
}

function unitLabel(unit: string) {
  switch (unit) {
    case "M2":
      return "m²";
    case "METER":
      return "m";
    case "HOUR":
      return "Std.";
    case "FIXED":
      return "pauschal";
    case "ITEM":
      return "Stk.";
    default:
      return unit || "";
  }
}

export async function buildOfferPdf(offer: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const company = offer.companyProfile;
      const client = offer.client;
      const items = Array.isArray(offer.items) ? offer.items : [];

      doc.fontSize(18).text("Angebot", { align: "right" });
      doc.moveDown();

      doc.fontSize(10);
      doc.text(company?.companyName || "Ihre Firma");
      if (company?.addressLine1) doc.text(company.addressLine1);
      if (company?.postalCode || company?.city) {
        doc.text(`${company?.postalCode || ""} ${company?.city || ""}`.trim());
      }
      if (company?.email) doc.text(company.email);
      if (company?.phone) doc.text(company.phone);

      doc.moveDown();
      doc.text("An:");
      doc.text(client?.name || "");
      if (client?.addressLine1) doc.text(client.addressLine1);
      if (client?.postalCode || client?.city) {
        doc.text(`${client?.postalCode || ""} ${client?.city || ""}`.trim());
      }

      doc.moveDown();
      doc.text(`Angebotsnummer: ${offer.offerNumber || "-"}`);
      doc.text(`Datum: ${new Date().toLocaleDateString("de-DE")}`);
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
      doc.text("Menge", 320, y);
      doc.text("EP", 400, y);
      doc.text("Gesamt", 480, y);

      doc.moveTo(50, y + 15).lineTo(545, y + 15).stroke();
      y += 25;

      for (const item of items) {
        const qtyText =
          item.quantity !== null && item.quantity !== undefined
            ? `${item.quantity} ${unitLabel(item.unit)}`
            : "prüfen";

        doc.text(String(item.position || ""), 50, y);
        doc.text(item.title || "", 90, y, { width: 210 });
        doc.text(qtyText, 320, y, { width: 70 });
        doc.text(euro(item.unitPriceCents || 0), 400, y, { width: 60 });
        doc.text(euro(item.totalCents || 0), 480, y, { width: 60 });

        y += 34;

        if (item.description) {
          doc.fontSize(8).fillColor("gray");
          doc.text(item.description, 90, y - 8, { width: 210 });
          doc.fillColor("black").fontSize(10);
        }

        if (y > 720) {
          doc.addPage();
          y = 60;
        }
      }

      doc.moveDown(2);
      doc.text(`Zwischensumme: ${euro(offer.subtotalCents || 0)}`, { align: "right" });
      doc.text(`MwSt. (${offer.vatPercent || 19}%): ${euro(offer.vatAmountCents || 0)}`, {
        align: "right"
      });
      doc.fontSize(12).text(`Gesamt: ${euro(offer.totalCents || 0)}`, { align: "right" });

      doc.moveDown();
      if (offer.notes) doc.fontSize(10).text(`Hinweise: ${offer.notes}`);
      if (offer.paymentTerms) {
        doc.fontSize(10).text(`Zahlungsbedingungen: ${offer.paymentTerms}`);
      }
      if (offer.footerText) {
        doc.moveDown();
        doc.fontSize(10).text(offer.footerText);
      }

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}