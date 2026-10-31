import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const discountRules = await prisma.discountRule.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ discountRules });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch discount rules" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can configure discount rules." }, { status: 403 });
    }

    const body = await req.json();
    const {
      code,
      name,
      type = "PERCENTAGE",
      value,
      minPurchaseAmount,
      minQuantity,
      startDate,
      endDate,
      usageLimit,
      appliesTo = "SUBSCRIPTION",
      targetProductId,
    } = body;

    if (!code || !name || value === undefined) {
      return NextResponse.json({ error: "Discount code, name, and value are required." }, { status: 400 });
    }

    const trimmedCode = code.toUpperCase().trim();

    const existing = await prisma.discountRule.findUnique({
      where: { code: trimmedCode },
    });
    if (existing) {
      return NextResponse.json({ error: "A discount rule with this code already exists." }, { status: 409 });
    }

    const rule = await prisma.discountRule.create({
      data: {
        code: trimmedCode,
        name,
        type: type.toUpperCase(),
        value: parseFloat(value),
        minPurchaseAmount: minPurchaseAmount ? parseFloat(minPurchaseAmount) : null,
        minQuantity: minQuantity ? parseInt(minQuantity) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        appliesTo: appliesTo.toUpperCase(),
        targetProductId: targetProductId || null,
      },
    });

    return NextResponse.json({ success: true, rule });
  } catch (error: any) {
    console.error("Create discount rule error:", error);
    return NextResponse.json({ error: "Failed to create discount rule" }, { status: 500 });
  }
}
