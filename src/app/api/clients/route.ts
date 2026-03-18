import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";

export async function GET() {
  const user = await getDemoUser();
  const clients = await prisma.client.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const user = await getDemoUser();
  const body = await req.json();

  const client = await prisma.client.create({
    data: {
      userId: user.id,
      name: body.name,
      email: body.email || null,
      city: body.city || null,
      projectLocation: body.projectLocation || null
    }
  });

  return NextResponse.json(client);
}