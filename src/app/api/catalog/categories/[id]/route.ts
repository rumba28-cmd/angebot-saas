import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getDemoUser();
  const body = await req.json();

  const existing = await prisma.serviceCategory.findFirst({
    where: { id: params.id, userId: user.id }
  });

  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const updated = await prisma.serviceCategory.update({
    where: { id: params.id },
    data: {
      name: body.name ?? existing.name,
      isArchived:
        typeof body.isArchived === "boolean"
          ? body.isArchived
          : existing.isArchived,
      sortOrder:
        typeof body.sortOrder === "number"
          ? body.sortOrder
          : existing.sortOrder
    }
  });

  return NextResponse.json(updated);
}