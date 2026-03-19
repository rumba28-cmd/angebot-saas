import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";

const ALLOWED = ["DRAFT", "SENT", "PARTIAL", "PAID", "OVERDUE", "CANCELED"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getDemoUser();
    const body = await req.json();

    if (!ALLOWED.includes(body?.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id: params.id, userId: user.id }
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: body.status
      }
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("Invoice status update error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to update invoice status" },
      { status: 500 }
    );
  }
}