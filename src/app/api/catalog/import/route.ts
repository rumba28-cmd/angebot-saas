import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";

export async function POST(req: NextRequest) {
  const user = await getDemoUser();
  const body = await req.json();
  const templateIds: string[] = Array.isArray(body.templateIds) ? body.templateIds : [];

  if (templateIds.length === 0) {
    return NextResponse.json({ error: "No templateIds provided" }, { status: 400 });
  }

  const templates = await prisma.masterServiceTemplate.findMany({
    where: { id: { in: templateIds }, isActive: true },
    include: { category: true },
    orderBy: { defaultSortOrder: "asc" }
  });

  let importedCount = 0;

  for (const tpl of templates) {
    const exists = await prisma.serviceItem.findFirst({
      where: {
        userId: user.id,
        OR: [
          { sourceTemplateId: tpl.id },
          { title: tpl.title, unit: tpl.unit }
        ]
      }
    });

    if (exists) continue;

    let userCategory = await prisma.serviceCategory.findFirst({
      where: {
        userId: user.id,
        name: tpl.category.name,
        isArchived: false
      }
    });

    if (!userCategory) {
      userCategory = await prisma.serviceCategory.create({
        data: {
          userId: user.id,
          name: tpl.category.name,
          sortOrder: tpl.category.sortOrder
        }
      });
    }

    const maxSort = await prisma.serviceItem.aggregate({
      where: {
        userId: user.id,
        categoryId: userCategory.id
      },
      _max: {
        sortOrder: true
      }
    });

    await prisma.serviceItem.create({
      data: {
        userId: user.id,
        categoryId: userCategory.id,
        sourceTemplateId: tpl.id,
        title: tpl.title,
        description: tpl.description,
        unit: tpl.unit,
        unitPriceCents: 0,
        vatPercent: tpl.vatPercent,
        keywordsText: tpl.keywordsText,
        synonymsText: tpl.synonymsText,
        offerTextTemplate: tpl.offerTextTemplate,
        requiresQuantity: tpl.requiresQuantity,
        sortOrder: (maxSort._max.sortOrder || 0) + 1
      }
    });

    importedCount++;
  }

  return NextResponse.json({ importedCount });
}