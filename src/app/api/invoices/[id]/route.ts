import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";

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

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getDemoUser();

    const invoice = await prisma.invoice.findFirst({
      where: { id: params.id, userId: user.id },
      include: {
        items: { orderBy: { position: "asc" } },
        client: true,
        companyProfile: true,
        sourceOffer: true
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to load invoice" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getDemoUser();
    const body = await req.json();

    const invoice = await prisma.invoice.findFirst({
      where: { id: params.id, userId: user.id },
      include: { items: true }
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const { normalized, subtotalCents, vatAmountCents, totalCents } = calcTotals(
      body.items || invoice.items,
      Number(body.vatPercent || invoice.vatPercent)
    );

    await prisma.$transaction(async (tx) => {
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          subject: body.subject ?? invoice.subject,
          introText: body.introText ?? invoice.introText,
          issueDate: body.issueDate ? new Date(body.issueDate) : invoice.issueDate,
          serviceDate: body.serviceDate ? new Date(body.serviceDate) : invoice.serviceDate,
          dueDate: body.dueDate ? new Date(body.dueDate) : invoice.dueDate,
          paymentTerms: body.paymentTerms ?? invoice.paymentTerms,
          notes: body.notes ?? invoice.notes,
          footerText: body.footerText ?? invoice.footerText,
          status: body.status ?? invoice.status,
          vatPercent: Number(body.vatPercent ?? invoice.vatPercent),
          subtotalCents,
          vatAmountCents,
          totalCents
        }
      });

      for (const item of normalized) {
        await tx.invoiceItem.update({
          where: { id: item.id },
          data: {
            title: item.title,
            description: item.description || null,
            quantity: item.quantity,
            unit: item.unit,
            unitPriceCents: item.unitPriceCents,
            totalCents: item.totalCents,
            vatPercent: Number(item.vatPercent || invoice.vatPercent)
          }
        });
      }
    });

    const updated = await prisma.invoice.findFirst({
      where: { id: invoice.id, userId: user.id },
      include: {
        items: { orderBy: { position: "asc" } },
        client: true,
        companyProfile: true,
        sourceOffer: true
      }
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("PATCH /api/invoices/[id] error:", e);
    return NextResponse.json({ error: e?.message || "Failed to update invoice" }, { status: 500 });
  }
}