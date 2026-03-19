import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";
import { requireActiveSubscription } from "@/lib/access";
import { buildInvoicePdf } from "@/lib/invoice-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getDemoUser();
    await requireActiveSubscription(user.id);

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId: user.id
      },
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

    const pdf = await buildInvoicePdf(invoice);

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`
      }
    });
  } catch (e: any) {
    console.error("Invoice PDF error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to generate invoice PDF" },
      { status: 500 }
    );
  }
}