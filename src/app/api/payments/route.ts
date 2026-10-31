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
    const invoiceId = searchParams.get("invoiceId");

    const where: any = {};
    if (invoiceId) {
      where.invoiceId = invoiceId;
    }

    // Customer can only see payments on their own invoices
    if (user.role === "CUSTOMER") {
      where.invoice = { customerId: user.id };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            status: true,
            customer: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { paymentDate: "desc" },
    });

    return NextResponse.json({ payments });
  } catch (error: any) {
    console.error("Fetch payments error:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized. Staff/Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const {
      invoiceId,
      amount,
      paymentMethod = "BANK_TRANSFER",
      paymentDate,
      transactionReference,
      notes,
    } = body;

    if (!invoiceId || amount === undefined) {
      return NextResponse.json({ error: "Invoice ID and payment amount are required." }, { status: 400 });
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return NextResponse.json({ error: "Payment amount must be greater than zero." }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    if (invoice.status === "CANCELLED") {
      return NextResponse.json({ error: "Cannot record payment on a cancelled invoice." }, { status: 400 });
    }

    if (invoice.balanceDue <= 0 && invoice.status === "PAID") {
      return NextResponse.json({ error: "This invoice is already fully paid." }, { status: 400 });
    }

    // Generate unique payment reference: PAY-YYYY-XXXX
    const paymentCount = await prisma.payment.count();
    const paymentYear = new Date().getFullYear();
    const paymentNumber = `PAY-${paymentYear}-${String(paymentCount + 1).padStart(4, "0")}`;

    const newPaidAmount = invoice.paidAmount + paymentAmount;
    const newBalanceDue = Math.max(0, invoice.totalAmount - newPaidAmount);
    const newStatus = newBalanceDue <= 0.001 ? "PAID" : "CONFIRMED";

    const [payment, updatedInvoice] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          paymentNumber,
          invoiceId,
          amount: paymentAmount,
          paymentMethod,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          transactionReference: transactionReference || null,
          notes: notes || null,
        },
      }),
      prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaidAmount,
          balanceDue: newBalanceDue,
          status: newStatus,
        },
        include: {
          customer: true,
          lines: true,
          payments: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      payment,
      invoice: updatedInvoice,
      message: `Payment of $${paymentAmount.toFixed(2)} recorded successfully against ${invoice.invoiceNumber}. New status: ${newStatus}.`,
    });
  } catch (error: any) {
    console.error("Record payment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to record payment" },
      { status: 500 }
    );
  }
}

