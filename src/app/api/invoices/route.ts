import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");

    const where: any = {};

    // Customer can only see their own invoices
    if (user.role === "CUSTOMER") {
      where.customerId = user.id;
    } else if (customerId) {
      where.customerId = customerId;
    }

    const now = new Date();

    if (status && status !== "ALL") {
      if (status === "OVERDUE") {
        where.status = { notIn: ["PAID", "CANCELLED"] };
        where.dueDate = { lt: now };
      } else {
        where.status = status.toUpperCase();
      }
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true, company: true },
        },
        subscription: {
          select: { id: true, subscriptionNumber: true, paymentTerms: true },
        },
        payments: true,
        _count: {
          select: { lines: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Augment with isOverdue flag
    const mapped = invoices.map((inv) => {
      const isOverdue =
        inv.status !== "PAID" &&
        inv.status !== "CANCELLED" &&
        new Date(inv.dueDate) < now;
      return {
        ...inv,
        isOverdue,
      };
    });

    return NextResponse.json({ invoices: mapped });
  } catch (error: any) {
    console.error("Fetch invoices error:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}
