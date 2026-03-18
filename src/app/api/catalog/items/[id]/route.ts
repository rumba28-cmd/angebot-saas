import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getDemoUser();
  const body = await req.json();

  const existing = await prisma.serviceItem.findFirst({
    where: { id: params.id, userId: user.id }
  });

  if (!existing) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const updated = await prisma.serviceItem.update({
    where: { id: params.id },
    data: {
      categoryId: body.categoryId ?? existing.categoryId,
      title: body.title ?? existing.title,
      description: body.description ?? existing.description,
      unit: body.unit ?? existing.unit,
      unitPriceCents: body.unitPriceCents !== undefined ? Number(body.unitPriceCents) : existing.unitPriceCents,
      vatPercent: body.vatPercent !== undefined ? Number(body.vatPercent) : existing.vatPercent,
      keywordsText: body.keywordsText ?? existing.keywordsText,
      synonymsText: body.synonymsText ?? existing.synonymsText,
      offerTextTemplate: body.offerTextTemplate ?? existing.offerTextTemplate,
      requiresQuantity: body.requiresQuantity !== undefined ? Boolean(body.requiresQuantity) : existing.requiresQuantity,
      isFavorite: body.isFavorite !== undefined ? Boolean(body.isFavorite) : existing.isFavorite,
      isArchived: body.isArchived !== undefined ? Boolean(body.isArchived) : existing.isArchived
    },
    include: {
      category: true,
      sourceTemplate: true
    }
  });

  return NextResponse.json(updated);
}