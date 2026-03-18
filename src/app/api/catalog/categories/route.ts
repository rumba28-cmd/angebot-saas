import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";

export async function GET() {
  const user = await getDemoUser();

  const categories = await prisma.serviceCategory.findMany({
    where: { userId: user.id, isArchived: false },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
  });

  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const user = await getDemoUser();
  const body = await req.json();

  const maxSort = await prisma.serviceCategory.aggregate({
    where: { userId: user.id },
    _max: { sortOrder: true }
  });

  const category = await prisma.serviceCategory.create({
    data: {
      userId: user.id,
      name: body.name,
      sortOrder: (maxSort._max.sortOrder || 0) + 1
    }
  });

  return NextResponse.json(category);
}