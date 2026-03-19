import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";
import { requireActiveSubscription } from "@/lib/access";

function buildInvoiceNumber(n: number) {
  const year = new Date().getFullYear();
  return `RE-${year}-${String(n).padStart(5, "0")}`;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getDemoUser();
    await requireActiveSubscription(user.id);

    const body = await req.json();
    const offerId = body?.offerId;
    const type = body?.type || "STANDARD";
    const percent = Number(body?.percent || 0);

    if (!offerId) {
      return NextResponse.json({ error: "offerId is required" }, { status: 400 });
    }

    const offer = await prisma.offer.findFirst({
      where: { id: offerId, userId: user.id },
      include: {
        items: { orderBy: { position: "asc" } },
        client: true,
        companyProfile: true
      }
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const count = await prisma.invoice.count({
      where: { userId: user.id }
    });

    let itemsToCreate: any[] = [];
    let invoiceType = "STANDARD";
    let subject = `Rechnung zu Angebot ${offer.offerNumber}`;
    let subtotalCents = offer.subtotalCents;
    let vatPercent = offer.vatPercent;
    let vatAmountCents = offer.vatAmountCents;
    let totalCents = offer.totalCents;

    if (type === "STANDARD") {
      itemsToCreate = offer.items.map((item) => ({
        serviceItemId: item.serviceItemId || null,
        position: item.position,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPriceCents: item.unitPriceCents,
        totalCents: item.totalCents,
        vatPercent: item.vatPercent
      }));
    }

    if (type === "ABSCHLAG") {
      if (!percent || percent <= 0 || percent > 100) {
        return NextResponse.json({ error: "percent must be between 1 and 100" }, { status: 400 });
      }

      invoiceType = "ABSCHLAG";
      subject = `Abschlagsrechnung (${percent}%) zu Angebot ${offer.offerNumber}`;

      subtotalCents = Math.round(offer.subtotalCents * (percent / 100));
      vatAmountCents = Math.round(subtotalCents * (vatPercent / 100));
      totalCents = subtotalCents + vatAmountCents;

      itemsToCreate = [
        {
          serviceItemId: null,
          position: 1,
          title: `Abschlagsrechnung ${percent}%`,
          description: `Abschlagsrechnung zu Angebot ${offer.offerNumber}`,
          quantity: 1,
          unit: "ITEM",
          unitPriceCents: subtotalCents,
          totalCents: subtotalCents,
          vatPercent
        }
      ];
    }

    if (type === "SCHLUSS") {
      invoiceType = "SCHLUSS";
      subject = `Schlussrechnung zu Angebot ${offer.offerNumber}`;

      const previousInvoices = await prisma.invoice.findMany({
        where: {
          userId: user.id,
          sourceOfferId: offer.id,
          type: { in: ["ABSCHLAG", "TEIL"] },
          status: { not: "CANCELED" }
        }
      });

      const previousSubtotal = previousInvoices.reduce(
        (sum, inv) => sum + (inv.subtotalCents || 0),
        0
      );

      itemsToCreate = offer.items.map((item) => ({
        serviceItemId: item.serviceItemId || null,
        position: item.position,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPriceCents: item.unitPriceCents,
        totalCents: item.totalCents,
        vatPercent: item.vatPercent
      }));

      if (previousSubtotal > 0) {
        itemsToCreate.push({
          serviceItemId: null,
          position: itemsToCreate.length + 1,
          title: "Abzüglich bereits berechnete Abschläge",
          description: `Verrechnung bisheriger Abschlags-/Teilrechnungen zu ${offer.offerNumber}`,
          quantity: 1,
          unit: "ITEM",
          unitPriceCents: -previousSubtotal,
          totalCents: -previousSubtotal,
          vatPercent
        });
      }

      subtotalCents = itemsToCreate.reduce((sum, item) => sum + item.totalCents, 0);
      vatAmountCents = Math.round(subtotalCents * (vatPercent / 100));
      totalCents = subtotalCents + vatAmountCents;
    }

    const invoice = await prisma.invoice.create({
      data: {
        userId: user.id,
        clientId: offer.clientId,
        companyProfileId: offer.companyProfileId,
        sourceOfferId: offer.id,
        invoiceNumber: buildInvoiceNumber(count + 1),
        type: invoiceType,
        title: "Rechnung",
        subject,
        introText:
          invoiceType === "ABSCHLAG"
            ? "Sehr geehrte Damen und Herren,\n\nhiermit stellen wir Ihnen folgende Abschlagsrechnung."
            : invoiceType === "SCHLUSS"
            ? "Sehr geehrte Damen und Herren,\n\nhiermit stellen wir Ihnen die Schlussrechnung."
            : "Sehr geehrte Damen und Herren,\n\nfür die nachfolgend aufgeführten Leistungen stellen wir Ihnen folgende Rechnung.",
        issueDate: new Date(),
        serviceDate: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        currency: offer.currency,
        vatPercent,
        subtotalCents,
        vatAmountCents,
        totalCents,
        paymentTerms: "Bitte zahlen Sie innerhalb von 14 Tagen ohne Abzug.",
        footerText: offer.footerText,
        items: {
          create: itemsToCreate
        }
      }
    });

    return NextResponse.json({ id: invoice.id });
  } catch (e: any) {
    console.error("POST /api/invoices/from-offer error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to create invoice from offer" },
      { status: 500 }
    );
  }
}