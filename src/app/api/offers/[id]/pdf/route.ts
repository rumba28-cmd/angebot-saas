import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";
import { requireActiveSubscription } from "@/lib/access";
import { buildOfferPdf } from "@/lib/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getDemoUser();
    await requireActiveSubscription(user.id);

    const offer = await prisma.offer.findFirst({
      where: {
        id: params.id,
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

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const buffer = await buildOfferPdf(offer);

    await prisma.pDFDocument.create({
      data: {
        offerId: offer.id,
        offerVersion: offer.currentVersion,
        storageUrl: `generated://${offer.id}/${Date.now()}.pdf`,
        fileName: `${offer.offerNumber}.pdf`,
        fileSize: buffer.length
      }
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${offer.offerNumber}.pdf"`
      }
    });
  } catch (e: any) {
    console.error("PDF route error:", e);
    return NextResponse.json(
      { error: e?.message || "PDF generation failed" },
      { status: 500 }
    );
  }
}