import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const taxRules = await prisma.taxRule.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ taxRules });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch tax rules" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can configure tax rules." }, { status: 403 });
    }

    const { name, rate, isDefault, description } = await req.json();

    if (!name || rate === undefined) {
      return NextResponse.json({ error: "Tax rule name and rate are required." }, { status: 400 });
    }

    // If isDefault is true, unset other default rules
    if (isDefault) {
      await prisma.taxRule.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const rule = await prisma.taxRule.create({
      data: {
        name,
        rate: parseFloat(rate),
        isDefault: Boolean(isDefault),
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, rule });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create tax rule" }, { status: 500 });
  }
}

