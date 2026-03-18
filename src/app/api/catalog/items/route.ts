import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";

export async function GET(req: NextRequest) {
  const user = await getDemoUser();
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const sort = searchParams.get("sort") || "manual";
  const status = searchParams.get("status") || "active";
  const favorites = searchParams.get("favorites") === "true";

  const where: any = {
    userId: user.id
  };

  if (categoryId) where.categoryId = categoryId;
  if (status === "active") where.isArchived = false;
  if (status === "archived") where.isArchived = true;
  if (favorites) where.isFavorite = true;

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { keywordsText: { contains: search } },
      { synonymsText: { contains: search } }
    ];
  }

  let orderBy: any[] = [{ sortOrder: "asc" }];

  if (sort === "name_asc") orderBy = [{ title: "asc" }];
  if (sort === "name_desc") orderBy = [{ title: "desc" }];
  if (sort === "price_asc") orderBy = [{ unitPriceCents: "asc" }];
  if (sort === "price_desc") orderBy = [{ unitPriceCents: "desc" }];
  if (sort === "used_desc") orderBy = [{ usageCount: "desc" }, { title: "asc" }];
  if (sort === "favorite_first") orderBy = [{ isFavorite: "desc" }, { sortOrder: "asc" }];
  if (sort === "category") orderBy = [{ categoryId: "asc" }, { sortOrder: "asc" }];

  const items = await prisma.serviceItem.findMany({
    where,
    orderBy,
    include: {
      category: true,
      sourceTemplate: {
        include: {
          category: true
        }
      }
    }
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const user = await getDemoUser();
  const body = await req.json();

  const maxSort = await prisma.serviceItem.aggregate({
    where: {
      userId: user.id,
      categoryId: body.categoryId || null
    },
    _max: {
      sortOrder: true
    }
  });

  const item = await prisma.serviceItem.create({
    data: {
      userId: user.id,
      categoryId: body.categoryId || null,
      title: body.title,
      description: body.description || null,
      unit: body.unit,
      unitPriceCents: Number(body.unitPriceCents || 0),
      vatPercent: Number(body.vatPercent || 19),
      keywordsText: body.keywordsText || "",
      synonymsText: body.synonymsText || null,
      offerTextTemplate: body.offerTextTemplate || null,
      requiresQuantity: Boolean(body.requiresQuantity),
      isFavorite: Boolean(body.isFavorite),
      sortOrder: (maxSort._max.sortOrder || 0) + 1
    },
    include: {
      category: true,
      sourceTemplate: true
    }
  });

  return NextResponse.json(item);
}