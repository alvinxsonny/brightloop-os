import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ plans });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can configure new plans." }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      description,
      frequency,
      price,
      minQuantity,
      startDate,
      endDate,
      autoClose,
      allowEarlyClose,
      allowPause,
      allowRenew,
    } = body;

    if (!name || !frequency) {
      return NextResponse.json({ error: "Plan name and billing frequency are required." }, { status: 400 });
    }

    const plan = await prisma.plan.create({
      data: {
        name,
        description: description || null,
        frequency: frequency.toUpperCase(),
        price: price ? parseFloat(price) : 0,
        minQuantity: minQuantity ? parseInt(minQuantity) : 1,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        autoClose: Boolean(autoClose),
        allowEarlyClose: allowEarlyClose !== undefined ? Boolean(allowEarlyClose) : true,
        allowPause: allowPause !== undefined ? Boolean(allowPause) : true,
        allowRenew: allowRenew !== undefined ? Boolean(allowRenew) : true,
      },
    });

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error("Create plan error:", error);
    return NextResponse.json({ error: "Failed to create plan." }, { status: 500 });
  }
}

