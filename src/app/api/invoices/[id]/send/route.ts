import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";
import { requireActiveSubscription } from "@/lib/access";
import { buildInvoicePdf } from "@/lib/invoice-pdf";
import { sendEmailWithAttachment } from "@/lib/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getDemoUser();
    await requireActiveSubscription(user.id);

    const body = await req.json();
    const recipient = body?.recipientEmail;

    if (!recipient) {
      return NextResponse.json({ error: "recipientEmail is required" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId: user.id
      },
      include: {
        items: { orderBy: { position: "asc" } },
        client: true,
        companyProfile: true
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const pdf = await buildInvoicePdf(invoice);

    await sendEmailWithAttachment({
      to: recipient,
      subject: `Ihre Rechnung ${invoice.invoiceNumber}`,
      text:
        `Sehr geehrte Damen und Herren,\n\n` +
        `anbei erhalten Sie unsere Rechnung ${invoice.invoiceNumber}.\n\n` +
        `Mit freundlichen Grüßen\n${invoice.companyProfile?.companyName || "Ihre Firma"}`,
      html:
        `<p>Sehr geehrte Damen und Herren,</p>` +
        `<p>anbei erhalten Sie unsere Rechnung <strong>${invoice.invoiceNumber}</strong>.</p>` +
        `<p>Mit freundlichen Grüßen<br/>${invoice.companyProfile?.companyName || "Ihre Firma"}</p>`,
      attachmentName: `${invoice.invoiceNumber}.pdf`,
      attachmentContent: pdf
    });

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: invoice.status === "DRAFT" ? "SENT" : invoice.status
      }
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Invoice send error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to send invoice email" },
      { status: 500 }
    );
  }
}