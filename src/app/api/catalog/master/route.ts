import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";

export async function GET() {
  const user = await getDemoUser();

  const [categories, importedItems] = await Promise.all([
    prisma.masterServiceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        templates: {
          where: { isActive: true },
          orderBy: { defaultSortOrder: "asc" }
        }
      }
    }),
    prisma.serviceItem.findMany({
      where: { userId: user.id, sourceTemplateId: { not: null }, isArchived: false },
      select: { sourceTemplateId: true }
    })
  ]);

  const importedSet = new Set(
    importedItems.map((x) => x.sourceTemplateId).filter(Boolean) as string[]
  );

  const result = categories.map((cat) => ({
    ...cat,
    templates: cat.templates.map((tpl) => ({
      ...tpl,
      imported: importedSet.has(tpl.id)
    }))
  }));

  return NextResponse.json(result);
}