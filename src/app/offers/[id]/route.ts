import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";

function recalc(items: any[], vatPercent = 19) {
  const normalized = items.map((item) => {
    const quantity = item.quantity === "" || item.quantity === null ? null : Number(item.quantity);
    const totalCents =
      quantity !== null
        ? Math.round(quantity * Number(item.unitPriceCents))
        : item.unit === "FIXED" || item.unit === "ITEM"
        ? Number(item.unitPriceCents)
        : 0;

    return {
      ...item,
      quantity,
      totalCents
    };
  });

  const subtotalCents = normalized.reduce((sum, item) => sum + item.totalCents, 0);
  const vatAmountCents = Math.round(subtotalCents * (vatPercent / 100));
  const totalCents = subtotalCents + vatAmountCents;

  return { items: normalized, subtotalCents, vatAmountCents, totalCents };
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await getDemoUser();

  const offer = await prisma.offer.findFirst({
    where: { id: params.id, userId: user.id },
    include: { items: true, client: true }
  });

  if (!offer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(offer);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getDemoUser();
  const body = await req.json();

  const offer = await prisma.offer.findFirst({
    where: { id: params.id, userId: user.id },
    include: { items: true }
  });

  if (!offer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const calc = recalc(body.items || offer.items, offer.vatPercent);

  await prisma.$transaction(async (tx) => {
    await tx.offer.update({
      where: { id: offer.id },
      data: {
        title: body.title,
        subject: body.subject,
        introText: body.introText,
        paymentTerms: body.paymentTerms,
        notes: body.notes,
        footerText: body.footerText,
        subtotalCents: calc.subtotalCents,
        vatAmountCents: calc.vatAmountCents,
        totalCents: calc.totalCents,
        currentVersion: { increment: 1 }
      }
    });

    for (const item of calc.items) {
      await tx.offerItem.update({
        where: { id: item.id },
        data: {
          title: item.title,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPriceCents: Number(item.unitPriceCents),
          totalCents: item.totalCents,
          needsConfirmation: item.quantity === null && item.unit !== "FIXED" && item.unit !== "ITEM"
        }
      });
    }

    const updated = await tx.offer.findUnique({
      where: { id: offer.id },
      include: { items: true, client: true }
    });

    if (updated) {
      await tx.offerVersion.create({
        data: {
          offerId: updated.id,
          versionNumber: updated.currentVersion,
          snapshotJson: JSON.stringify(updated),
          createdByUserId: user.id,
          changeNote: "Manuelle Bearbeitung"
        }
      });
    }
  });

  const updatedOffer = await prisma.offer.findUnique({
    where: { id: offer.id },
    include: { items: true, client: true }
  });

  return NextResponse.json(updatedOffer);
}