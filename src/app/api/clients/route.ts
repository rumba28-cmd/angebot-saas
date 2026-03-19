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

  let body: any = {};

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    body = await req.json();
  } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    body = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      addressLine1: formData.get("addressLine1"),
      postalCode: formData.get("postalCode"),
      city: formData.get("city"),
      projectLocation: formData.get("projectLocation"),
      notes: formData.get("notes")
    };
  }

  if (!body?.name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: {
      userId: user.id,
      name: String(body.name),
      email: body.email ? String(body.email) : null,
      phone: body.phone ? String(body.phone) : null,
      addressLine1: body.addressLine1 ? String(body.addressLine1) : null,
      postalCode: body.postalCode ? String(body.postalCode) : null,
      city: body.city ? String(body.city) : null,
      projectLocation: body.projectLocation ? String(body.projectLocation) : null,
      notes: body.notes ? String(body.notes) : null
    }
  });

  if (contentType.includes("application/json")) {
    return NextResponse.json(client);
  }

  return NextResponse.redirect(new URL("/clients", req.url));
}