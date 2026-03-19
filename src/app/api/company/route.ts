import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";

export async function GET() {
  try {
    const user = await getDemoUser();

    const company = await prisma.companyProfile.findUnique({
      where: { userId: user.id }
    });

    return NextResponse.json(company);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to load company profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getDemoUser();
    const body = await req.json();

    const existing = await prisma.companyProfile.findUnique({
      where: { userId: user.id }
    });

    if (!existing) {
      const created = await prisma.companyProfile.create({
        data: {
          userId: user.id,
          companyName: body.companyName || "Meine Firma",
          ownerName: body.ownerName || null,
          addressLine1: body.addressLine1 || null,
          postalCode: body.postalCode || null,
          city: body.city || null,
          country: body.country || "Deutschland",
          phone: body.phone || null,
          email: body.email || null,
          vatNumber: body.vatNumber || null,
          taxNumber: body.taxNumber || null,
          iban: body.iban || null,
          bic: body.bic || null,
          bankName: body.bankName || null,
          logoUrl: body.logoUrl || null,
          defaultFooter: body.defaultFooter || null,
          legalText: body.legalText || null
        }
      });

      return NextResponse.json(created);
    }

    const updated = await prisma.companyProfile.update({
      where: { userId: user.id },
      data: {
        companyName: body.companyName ?? existing.companyName,
        ownerName: body.ownerName ?? existing.ownerName,
        addressLine1: body.addressLine1 ?? existing.addressLine1,
        postalCode: body.postalCode ?? existing.postalCode,
        city: body.city ?? existing.city,
        country: body.country ?? existing.country,
        phone: body.phone ?? existing.phone,
        email: body.email ?? existing.email,
        vatNumber: body.vatNumber ?? existing.vatNumber,
        taxNumber: body.taxNumber ?? existing.taxNumber,
        iban: body.iban ?? existing.iban,
        bic: body.bic ?? existing.bic,
        bankName: body.bankName ?? existing.bankName,
        logoUrl: body.logoUrl ?? existing.logoUrl,
        defaultFooter: body.defaultFooter ?? existing.defaultFooter,
        legalText: body.legalText ?? existing.legalText
      }
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("PATCH /api/company error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to save company profile" },
      { status: 500 }
    );
  }
}