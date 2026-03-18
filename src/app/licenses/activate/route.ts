import { NextRequest, NextResponse } from "next/server";
import { getDemoUser } from "@/lib/demo-user";
import { activateLicense } from "@/lib/license";

export async function POST(req: NextRequest) {
  try {
    const user = await getDemoUser();
    const body = await req.json();
    const result = await activateLicense(user.id, body.key);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Activation failed" }, { status: 400 });
  }
}