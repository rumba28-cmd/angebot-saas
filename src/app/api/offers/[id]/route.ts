import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";

function recalc(items: any[], vatPercent = 19) {
  const safeItems = Array.isArray(items) ? items : [];

  const normalized = safeItems.map((item) => {
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

  return { items: normalized, subtotalCents, vatAmountCents, totalCents };
}

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getDemoUser();

    const offer = await prisma.offer.findFirst({
      where: {
        id: params.id,
        userId: user.id
      },
      include: {
        items: {
          orderBy: {
            position: "asc"
          }
        },
        client: true,
        companyProfile: true
      }
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: offer.id,
      offerNumber: offer.offerNumber,
      title: offer.title,
      subject: offer.subject,
      sourceText: offer.sourceText,
      introText: offer.introText,
      footerText: offer.footerText,
      paymentTerms: offer.paymentTerms,
      notes: offer.notes,
      validUntil: offer.validUntil,
      currency: offer.currency,
      subtotalCents: offer.subtotalCents,
      vatPercent: offer.vatPercent,
      vatAmountCents: offer.vatAmountCents,
      totalCents: offer.totalCents,
      status: offer.status,
      items: offer.items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPriceCents: item.unitPriceCents,
        totalCents: item.totalCents,
        vatPercent: item.vatPercent,
        needsConfirmation: item.needsConfirmation
      })),
      client: offer.client
        ? {
            id: offer.client.id,
            name: offer.client.name,
            email: offer.client.email,
            addressLine1: offer.client.addressLine1,
            postalCode: offer.client.postalCode,
            city: offer.client.city,
            projectLocation: offer.client.projectLocation
          }
        : null,
      companyProfile: offer.companyProfile
        ? {
            id: offer.companyProfile.id,
            companyName: offer.companyProfile.companyName,
            ownerName: offer.companyProfile.ownerName,
            addressLine1: offer.companyProfile.addressLine1,
            postalCode: offer.companyProfile.postalCode,
            city: offer.companyProfile.city,
            phone: offer.companyProfile.phone,
            email: offer.companyProfile.email
          }
        : null
    });
  } catch (e: any) {
    console.error("GET /api/offers/[id] error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to load offer" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getDemoUser();
    const body = await req.json();

    const offer = await prisma.offer.findFirst({
      where: {
        id: params.id,
        userId: user.id
      },
      include: {
        items: true,
        client: true,
        companyProfile: true
      }
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const calc = recalc(body.items || offer.items, body.vatPercent || offer.vatPercent);

    await prisma.$transaction(async (tx) => {
      await tx.offer.update({
        where: { id: offer.id },
        data: {
          title: body.title ?? offer.title,
          subject: body.subject ?? offer.subject,
          sourceText: body.sourceText ?? offer.sourceText,
          introText: body.introText ?? offer.introText,
          paymentTerms: body.paymentTerms ?? offer.paymentTerms,
          notes: body.notes ?? offer.notes,
          footerText: body.footerText ?? offer.footerText,
          validUntil: body.validUntil ? new Date(body.validUntil) : null,
          subtotalCents: calc.subtotalCents,
          vatPercent: Number(body.vatPercent ?? offer.vatPercent),
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
            unitPriceCents: item.unitPriceCents,
            totalCents: item.totalCents,
            vatPercent: Number(item.vatPercent ?? 19),
            needsConfirmation:
              item.quantity === null &&
              item.unit !== "FIXED" &&
              item.unit !== "ITEM"
          }
        });
      }

      const updated = await tx.offer.findUnique({
        where: { id: offer.id },
        include: { items: true, client: true, companyProfile: true }
      });

      if (updated) {
        await tx.offerVersion.create({
          data: {
            offerId: updated.id,
            versionNumber: updated.currentVersion,
            snapshotJson: JSON.stringify(updated),
            createdByUserId: user.id,
            changeNote: "Angebot bearbeitet"
          }
        });
      }
    });

    const updatedOffer = await prisma.offer.findFirst({
      where: {
        id: offer.id,
        userId: user.id
      },
      include: {
        items: {
          orderBy: { position: "asc" }
        },
        client: true,
        companyProfile: true
      }
    });

    return NextResponse.json({
      id: updatedOffer!.id,
      offerNumber: updatedOffer!.offerNumber,
      title: updatedOffer!.title,
      subject: updatedOffer!.subject,
      sourceText: updatedOffer!.sourceText,
      introText: updatedOffer!.introText,
      footerText: updatedOffer!.footerText,
      paymentTerms: updatedOffer!.paymentTerms,
      notes: updatedOffer!.notes,
      validUntil: updatedOffer!.validUntil,
      currency: updatedOffer!.currency,
      subtotalCents: updatedOffer!.subtotalCents,
      vatPercent: updatedOffer!.vatPercent,
      vatAmountCents: updatedOffer!.vatAmountCents,
      totalCents: updatedOffer!.totalCents,
      status: updatedOffer!.status,
      items: updatedOffer!.items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPriceCents: item.unitPriceCents,
        totalCents: item.totalCents,
        vatPercent: item.vatPercent,
        needsConfirmation: item.needsConfirmation
      })),
      client: updatedOffer!.client
        ? {
            id: updatedOffer!.client.id,
            name: updatedOffer!.client.name,
            email: updatedOffer!.client.email,
            addressLine1: updatedOffer!.client.addressLine1,
            postalCode: updatedOffer!.client.postalCode,
            city: updatedOffer!.client.city,
            projectLocation: updatedOffer!.client.projectLocation
          }
        : null,
      companyProfile: updatedOffer!.companyProfile
        ? {
            id: updatedOffer!.companyProfile.id,
            companyName: updatedOffer!.companyProfile.companyName,
            ownerName: updatedOffer!.companyProfile.ownerName,
            addressLine1: updatedOffer!.companyProfile.addressLine1,
            postalCode: updatedOffer!.companyProfile.postalCode,
            city: updatedOffer!.companyProfile.city,
            phone: updatedOffer!.companyProfile.phone,
            email: updatedOffer!.companyProfile.email
          }
        : null
    });
  } catch (e: any) {
    console.error("PATCH /api/offers/[id] error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to update offer" },
      { status: 500 }
    );
  }
}