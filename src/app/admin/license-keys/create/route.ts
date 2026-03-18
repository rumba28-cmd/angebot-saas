import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLicenseKeys } from "@/lib/license";

export async function POST(req: NextRequest) {
  const admin = await prisma.user.findUnique({
    where: { email: "admin@angebot.de" }
  });

  if (!admin) {
    return NextResponse.json({ error: "Admin not found" }, { status: 500 });
  }

  const body = await req.json();
  const keys = await createLicenseKeys(body.planId, Number(body.count || 1), admin.id);

  return NextResponse.json({ keys });
}