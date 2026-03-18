import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";
import { requireActiveSubscription } from "@/lib/access";
import { matchServicesToText } from "@/lib/matching";

function buildOfferNumber(n: number) {
  const year = new Date().getFullYear();
  return `AN-${year}-${String(n).padStart(5, "0")}`;
}

function calculateTotals(items: { totalCents: number }[], vatPercent = 19) {
  const subtotalCents = items.reduce((sum, item) => sum + item.totalCents, 0);
  const vatAmountCents = Math.round(subtotalCents * (vatPercent / 100));
  const totalCents = subtotalCents + vatAmountCents;
  return { subtotalCents, vatAmountCents, totalCents };
}

export async function GET() {
  const user = await getDemoUser();
  const offers = await prisma.offer.findMany({
    where: { userId: user.id },
    include: { client: true, items: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(offers);
}

export async function POST(req: NextRequest) {
  try {
    const user = await getDemoUser();
    await requireActiveSubscription(user.id);

    const body = await req.json();
    const catalog = await prisma.serviceItem.findMany({
      where: {
        userId: user.id,
        isArchived: false
      },
      orderBy: [{ isFavorite: "desc" }, { usageCount: "desc" }, { sortOrder: "asc" }]
    });

    const matches = matchServicesToText(body.text, catalog).slice(0, 10);

    if (matches.length === 0) {
      return NextResponse.json({ error: "Keine passenden Leistungen gefunden" }, { status: 400 });
    }

    const count = await prisma.offer.count({ where: { userId: user.id } });
    const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });

    const preparedItems = matches.map((m, index) => ({
      serviceItemId: m.serviceItem.id,
      position: index + 1,
      title: m.serviceItem.title,
      description: m.serviceItem.description,
      quantity: m.quantity,
      unit: m.serviceItem.unit,
      unitPriceCents: m.serviceItem.unitPriceCents,
      totalCents: m.totalCents,
      vatPercent: m.serviceItem.vatPercent,
      matchSource: m.source,
      needsConfirmation: m.needsConfirmation
    }));

    const totals = calculateTotals(preparedItems);

    const offer = await prisma.offer.create({
      data: {
        userId: user.id,
        clientId: body.clientId,
        companyProfileId: company?.id,
        offerNumber: buildOfferNumber(count + 1),
        title: "Angebot",
        subject: "Angebot für angefragte Bauleistungen",
        sourceText: body.text,
        introText:
          "Sehr geehrte Damen und Herren,\n\nvielen Dank für Ihre Anfrage. Auf Grundlage Ihrer Nachricht unterbreiten wir Ihnen folgendes Angebot.",
        footerText: company?.defaultFooter || "Mit freundlichen Grüßen",
        paymentTerms: "Zahlbar innerhalb von 7 Tagen nach Rechnungserhalt.",
        notes: "Mengen bitte vor Auftragsbeginn prüfen.",
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        ...totals,
        items: {
          create: preparedItems
        }
      },
      include: { items: true, client: true }
    });

    await prisma.offerVersion.create({
      data: {
        offerId: offer.id,
        versionNumber: 1,
        snapshotJson: JSON.stringify(offer),
        createdByUserId: user.id,
        changeNote: "Initiale Erstellung"
      }
    });

    for (const match of matches) {
      await prisma.serviceItem.update({
        where: { id: match.serviceItem.id },
        data: {
          usageCount: { increment: 1 }
        }
      });
    }

    return NextResponse.json({ id: offer.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create offer" }, { status: 400 });
  }
}