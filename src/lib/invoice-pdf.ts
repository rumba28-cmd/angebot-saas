import puppeteer from "puppeteer";

function euro(cents: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  }).format((cents || 0) / 100);
}

function unitLabel(unit: string) {
  if (unit === "M2") return "m²";
  if (unit === "METER") return "m";
  if (unit === "HOUR") return "Std.";
  if (unit === "FIXED") return "pauschal";
  if (unit === "ITEM") return "Stk.";
  return unit || "";
}

export function buildInvoiceHtml(invoice: any) {
  const items = Array.isArray(invoice.items) ? invoice.items : [];

  const rows = items
    .map(
      (item: any, index: number) => `
        <tr>
          <td>${index + 1}</td>
          <td>
            <div style="font-weight:600;">${item.title || ""}</div>
            <div style="color:#666;font-size:12px;">${item.description || ""}</div>
          </td>
          <td>${item.quantity !== null && item.quantity !== undefined ? `${item.quantity} ${unitLabel(item.unit)}` : "prüfen"}</td>
          <td>${euro(item.unitPriceCents || 0)}</td>
          <td>${euro(item.totalCents || 0)}</td>
        </tr>
      `
    )
    .join("");

  return `
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <title>${invoice.invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111; font-size: 12px; padding: 40px; }
    .top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; }
    .block { margin-bottom: 24px; }
    h1 { font-size: 24px; margin: 0 0 8px; }
    h2 { font-size: 14px; margin: 0 0 4px; }
    table { width:100%; border-collapse:collapse; margin-top: 20px; }
    th, td { border:1px solid #ddd; padding:8px; vertical-align:top; }
    th { background:#f5f5f5; text-align:left; }
    .totals { margin-top: 20px; width: 320px; margin-left: auto; }
    .totals div { display:flex; justify-content:space-between; padding: 4px 0; }
    .main-total { font-weight:700; font-size:16px; border-top:1px solid #999; margin-top:8px; padding-top:8px; }
  </style>
</head>
<body>
  <div class="top">
    <div>
      <h2>${invoice.companyProfile?.companyName || "Ihre Firma"}</h2>
      <div>${invoice.companyProfile?.addressLine1 || ""}</div>
      <div>${[invoice.companyProfile?.postalCode, invoice.companyProfile?.city].filter(Boolean).join(" ")}</div>
      <div>${invoice.companyProfile?.email || ""}</div>
      <div>${invoice.companyProfile?.phone || ""}</div>
    </div>

    <div style="text-align:right;">
      <h1>Rechnung</h1>
      <div><strong>Rechnungsnummer:</strong> ${invoice.invoiceNumber || ""}</div>
      <div><strong>Rechnungsdatum:</strong> ${
        invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString("de-DE") : ""
      }</div>
      <div><strong>Leistungsdatum:</strong> ${
        invoice.serviceDate ? new Date(invoice.serviceDate).toLocaleDateString("de-DE") : ""
      }</div>
      <div><strong>Fällig am:</strong> ${
        invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("de-DE") : ""
      }</div>
    </div>
  </div>

  <div class="block">
    <strong>An:</strong><br />
    ${invoice.client?.name || ""}<br />
    ${invoice.client?.addressLine1 || ""}<br />
    ${[invoice.client?.postalCode, invoice.client?.city].filter(Boolean).join(" ")}
  </div>

  <div class="block">
    <strong>${invoice.subject || "Rechnung"}</strong>
  </div>

  <div class="block">
    ${(invoice.introText || "").split("\n").map((x: string) => `<div>${x || "&nbsp;"}</div>`).join("")}
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:50px;">Pos.</th>
        <th>Leistung</th>
        <th style="width:120px;">Menge</th>
        <th style="width:120px;">EP</th>
        <th style="width:120px;">Gesamt</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="totals">
    <div><span>Zwischensumme</span><span>${euro(invoice.subtotalCents || 0)}</span></div>
    <div><span>MwSt. (${invoice.vatPercent || 19}%)</span><span>${euro(invoice.vatAmountCents || 0)}</span></div>
    <div class="main-total"><span>Gesamt</span><span>${euro(invoice.totalCents || 0)}</span></div>
  </div>

  ${
    invoice.paymentTerms
      ? `<div class="block"><strong>Zahlungsbedingungen</strong><br/>${invoice.paymentTerms}</div>`
      : ""
  }

  ${
    invoice.notes
      ? `<div class="block"><strong>Hinweise</strong><br/>${invoice.notes}</div>`
      : ""
  }

  <div class="block">
    ${(invoice.footerText || "").split("\n").map((x: string) => `<div>${x || "&nbsp;"}</div>`).join("")}
  </div>
</body>
</html>
  `;
}

export async function buildInvoicePdf(invoice: any): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true
  });

  try {
    const page = await browser.newPage();
    await page.setContent(buildInvoiceHtml(invoice), {
      waitUntil: "networkidle0"
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm"
      }
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}