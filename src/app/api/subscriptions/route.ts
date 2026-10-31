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

    // Customers only see their own subscriptions
    const where: any = {};
    if (user.role === "CUSTOMER") {
      where.customerId = user.id;
    } else if (customerId) {
      where.customerId = customerId;
    }

    if (status && status !== "ALL") {
      where.status = status.toUpperCase();
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true, company: true },
        },
        plan: true,
        lines: {
          include: {
            product: true,
            variant: true,
          },
        },
        invoices: {
          select: { id: true, invoiceNumber: true, status: true, totalAmount: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ subscriptions });
  } catch (error: any) {
    console.error("Fetch subscriptions error:", error);
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      customerId,
      planId,
      status = "QUOTATION",
      startDate,
      expiryDate,
      paymentTerms = "NET30",
      notes,
      lines = [],
    } = body;

    if (!customerId || !planId) {
      return NextResponse.json({ error: "Customer and Plan are required." }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: "Selected plan does not exist." }, { status: 404 });
    }

    // Default tax rule check
    const defaultTax = await prisma.taxRule.findFirst({
      where: { isDefault: true, isActive: true },
    });
    const defaultTaxRate = defaultTax ? defaultTax.rate : 0.0;

    // Validate min quantity
    const totalQuantity = lines.reduce((acc: number, l: any) => acc + (parseInt(l.quantity) || 1), 0);
    if (totalQuantity < plan.minQuantity) {
      return NextResponse.json(
        { error: `The selected plan requires a minimum quantity of ${plan.minQuantity}. You have ${totalQuantity}.` },
        { status: 400 }
      );
    }

    // Calculate dates
    const start = startDate ? new Date(startDate) : new Date();
    let nextBilling = new Date(start);
    if (plan.frequency === "DAILY") nextBilling.setDate(nextBilling.getDate() + 1);
    else if (plan.frequency === "WEEKLY") nextBilling.setDate(nextBilling.getDate() + 7);
    else if (plan.frequency === "MONTHLY") nextBilling.setMonth(nextBilling.getMonth() + 1);
    else if (plan.frequency === "YEARLY") nextBilling.setFullYear(nextBilling.getFullYear() + 1);

    // Generate unique Subscription Number
    const count = await prisma.subscription.count();
    const subNumber = `SUB-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    // Process line items
    let overallSubtotal = 0;
    let overallTax = 0;
    let overallDiscount = 0;

    const subscriptionLinesData = [];

    for (const item of lines) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;

      let variantSurcharge = 0;
      if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId } });
        if (variant) {
          variantSurcharge = variant.surcharge;
        }
      }

      const qty = parseInt(item.quantity) || 1;
      const unitPrice = item.unitPrice !== undefined ? parseFloat(item.unitPrice) : product.salesPrice;
      const lineSubtotal = (unitPrice + variantSurcharge) * qty;

      const discountRate = parseFloat(item.discountRate || 0);
      const discountAmount = (lineSubtotal * discountRate) / 100;

      const taxableBase = lineSubtotal - discountAmount;
      const taxRate = item.taxRate !== undefined ? parseFloat(item.taxRate) : defaultTaxRate;
      const taxAmount = (taxableBase * taxRate) / 100;
      const lineTotal = taxableBase + taxAmount;

      overallSubtotal += lineSubtotal;
      overallTax += taxAmount;
      overallDiscount += discountAmount;

      subscriptionLinesData.push({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: qty,
        unitPrice,
        variantSurcharge,
        taxRate,
        taxAmount,
        discountRate,
        discountAmount,
        subtotal: lineSubtotal,
        total: lineTotal,
      });
    }

    const overallTotal = overallSubtotal - overallDiscount + overallTax;

    const subscription = await prisma.subscription.create({
      data: {
        subscriptionNumber: subNumber,
        customerId,
        planId,
        status: status.toUpperCase(),
        startDate: start,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        nextBillingDate: nextBilling,
        paymentTerms,
        subtotal: overallSubtotal,
        taxAmount: overallTax,
        discountAmount: overallDiscount,
        totalAmount: overallTotal,
        notes: notes || null,
        lines: {
          create: subscriptionLinesData,
        },
      },
      include: {
        customer: true,
        plan: true,
        lines: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, subscription });
  } catch (error: any) {
    console.error("Create subscription error:", error);
    return NextResponse.json({ error: error.message || "Failed to create subscription" }, { status: 500 });
  }
}
