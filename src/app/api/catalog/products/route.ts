import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        variants: {
          where: { isActive: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, type, salesPrice, costPrice, notes, variants } = body;

    if (!name || salesPrice === undefined) {
      return NextResponse.json({ error: "Name and sales price are required." }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        type: type || "SERVICE",
        salesPrice: parseFloat(salesPrice),
        costPrice: costPrice ? parseFloat(costPrice) : 0,
        notes: notes || null,
        variants: {
          create: (variants || []).map((v: any) => ({
            name: v.name,
            surcharge: parseFloat(v.surcharge || 0),
            sku: v.sku || null,
          })),
        },
      },
      include: {
        variants: true,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
