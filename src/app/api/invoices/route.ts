import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";
import { requireActiveSubscription } from "@/lib/access";

function buildInvoiceNumber(n: number) {
  const year = new Date().getFullYear();
  return `RE-${year}-${String(n).padStart(5, "0")}`;
}

function calcTotals(items: any[], vatPercent = 19) {
  const normalized = (items || []).map((item) => {
    const quantity =
      item.quantity === "" || item.quantity === null || item.quantity === undefined
        ? null
        : Number(item.quantity);

    const unitPriceCents = Number(item.unitPriceCents || 0);

    const totalCents =
      quantity !== null
        ? Math.round(quantity * unitPriceCents)
        : item.unit === "FIXED" || item.unit === "ITEM"
        ? unitPriceCents
        : 0;

    return {
      ...item,
      quantity,
      unitPriceCents,
      totalCents
    };
  });

  const subtotalCents = normalized.reduce((sum, item) => sum + item.totalCents, 0);
  const vatAmountCents = Math.round(subtotalCents * (vatPercent / 100));
  const totalCents = subtotalCents + vatAmountCents;

  return { normalized, subtotalCents, vatAmountCents, totalCents };
}

export async function GET() {
  try {
    const user = await getDemoUser();

    const invoices = await prisma.invoice.findMany({
      where: { userId: user.id },
      include: { client: true, items: true, sourceOffer: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(invoices);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to load invoices" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getDemoUser();
    await requireActiveSubscription(user.id);

    const body = await req.json();

    if (!body?.clientId) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }

    const count = await prisma.invoice.count({
      where: { userId: user.id }
    });

    const company = await prisma.companyProfile.findUnique({
      where: { userId: user.id }
    });

    const inputItems = Array.isArray(body.items) ? body.items : [];
    const { normalized, subtotalCents, vatAmountCents, totalCents } = calcTotals(
      inputItems,
      Number(body.vatPercent || 19)
    );

    const invoice = await prisma.invoice.create({
      data: {
        userId: user.id,
        clientId: body.clientId,
        companyProfileId: company?.id || null,
        sourceOfferId: body.sourceOfferId || null,
        invoiceNumber: buildInvoiceNumber(count + 1),
        type: body.type || "STANDARD",
        title: "Rechnung",
        subject: body.subject || "Rechnung für erbrachte Leistungen",
        introText:
          body.introText ||
          "Sehr geehrte Damen und Herren,\n\nhiermit stellen wir Ihnen folgende Leistungen in Rechnung.",
        issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
        serviceDate: body.serviceDate ? new Date(body.serviceDate) : new Date(),
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        vatPercent: Number(body.vatPercent || 19),
        subtotalCents,
        vatAmountCents,
        totalCents,
        paymentTerms:
          body.paymentTerms || "Bitte überweisen Sie den Rechnungsbetrag innerhalb von 14 Tagen ohne Abzug.",
        notes: body.notes || null,
        footerText: body.footerText || company?.defaultFooter || null,
        items: {
          create: normalized.map((item: any, index: number) => ({
            serviceItemId: item.serviceItemId || null,
            position: index + 1,
            title: item.title,
            description: item.description || null,
            quantity: item.quantity,
            unit: item.unit,
            unitPriceCents: item.unitPriceCents,
            totalCents: item.totalCents,
            vatPercent: Number(item.vatPercent || body.vatPercent || 19)
          }))
        }
      },
      include: {
        items: true,
        client: true,
        companyProfile: true
      }
    });

    return NextResponse.json({ id: invoice.id });
  } catch (e: any) {
    console.error("POST /api/invoices error:", e);
    return NextResponse.json({ error: e?.message || "Failed to create invoice" }, { status: 500 });
  }
}