import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        subscription: {
          include: { plan: true },
        },
        lines: {
          include: {
            product: true,
            variant: true,
          },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (user.role === "CUSTOMER" && invoice.customerId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const isOverdue =
      invoice.status !== "PAID" &&
      invoice.status !== "CANCELLED" &&
      new Date(invoice.dueDate) < new Date();

    return NextResponse.json({
      invoice: {
        ...invoice,
        isOverdue,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}

