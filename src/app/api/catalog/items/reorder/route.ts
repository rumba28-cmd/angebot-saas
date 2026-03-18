import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";

export async function POST(req: NextRequest) {
  const user = await getDemoUser();
  const body = await req.json();

  const itemId = body.itemId as string;
  const direction = body.direction as "up" | "down";

  const current = await prisma.serviceItem.findFirst({
    where: {
      id: itemId,
      userId: user.id
    }
  });

  if (!current) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const siblings = await prisma.serviceItem.findMany({
    where: {
      userId: user.id,
      categoryId: current.categoryId,
      isArchived: false
    },
    orderBy: { sortOrder: "asc" }
  });

  const index = siblings.findIndex((x) => x.id === current.id);
  if (index === -1) {
    return NextResponse.json({ error: "Reorder failed" }, { status: 400 });
  }

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= siblings.length) {
    return NextResponse.json({ success: true });
  }

  const target = siblings[swapIndex];

  await prisma.$transaction([
    prisma.serviceItem.update({
      where: { id: current.id },
      data: { sortOrder: target.sortOrder }
    }),
    prisma.serviceItem.update({
      where: { id: target.id },
      data: { sortOrder: current.sortOrder }
    })
  ]);

  return NextResponse.json({ success: true });
}