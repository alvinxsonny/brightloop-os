import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const templates = await prisma.quotationTemplate.findMany({
      include: {
        plan: true,
        lines: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ templates });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch quotation templates" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, validityDays, planId, lines } = body;

    if (!name) {
      return NextResponse.json({ error: "Template name is required." }, { status: 400 });
    }

    const template = await prisma.quotationTemplate.create({
      data: {
        name,
        description: description || null,
        validityDays: validityDays ? parseInt(validityDays) : 30,
        planId: planId || null,
        lines: {
          create: (lines || []).map((line: any) => ({
            productId: line.productId,
            variantId: line.variantId || null,
            quantity: line.quantity ? parseInt(line.quantity) : 1,
            unitPrice: parseFloat(line.unitPrice || 0),
            discountPercent: line.discountPercent ? parseFloat(line.discountPercent) : 0,
          })),
        },
      },
      include: {
        plan: true,
        lines: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    console.error("Create template error:", error);
    return NextResponse.json({ error: "Failed to create quotation template." }, { status: 500 });
  }
}

