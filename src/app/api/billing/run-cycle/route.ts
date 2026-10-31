import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { forceAllActive = false, simulateDate } = body;

    const billingDate = simulateDate ? new Date(simulateDate) : new Date();

    // Query active subscriptions due for billing
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        ...(forceAllActive ? {} : { nextBillingDate: { lte: billingDate } }),
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
        invoices: {
          select: {
            id: true,
            issueDate: true,
            periodStart: true,
            periodEnd: true,
            status: true,
          },
        },
      },
    });

    // Fetch active default tax rule
    const defaultTaxRule = await prisma.taxRule.findFirst({
      where: { isDefault: true, isActive: true },
    });
    const defaultTaxRate = defaultTaxRule ? defaultTaxRule.rate : 0.0;

    // Fetch active discount rules
    const activeDiscounts = await prisma.discountRule.findMany({
      where: {
        isActive: true,
        OR: [{ startDate: null }, { startDate: { lte: billingDate } }],
        AND: [
          { OR: [{ endDate: null }, { endDate: { gte: billingDate } }] },
          // usageLimit null or timesUsed < usageLimit
        ],
      },
    });

    const generatedInvoices = [];
    const skippedSubscriptions = [];

    // Get current invoice count for numbering
    let invoiceCount = await prisma.invoice.count();

    for (const sub of subscriptions) {
      // Calculate period dates
      const periodStart = sub.lastBilledDate || sub.startDate;
      const periodEnd = new Date(billingDate);

      // IDEMPOTENCY CHECK:
      // Ensure no double billing: check if an invoice for this subscription was already generated
      // covering this billing cycle (same date or within same billing cycle)
      const alreadyBilled = sub.invoices.some((inv) => {
        if (inv.status === "CANCELLED") return false;
        const invDate = new Date(inv.issueDate);
        const diffHours = Math.abs(invDate.getTime() - billingDate.getTime()) / (1000 * 60 * 60);
        return diffHours < 12; // Already billed within last 12 hours
      });

      if (alreadyBilled && !forceAllActive) {
        skippedSubscriptions.push({
          subscriptionNumber: sub.subscriptionNumber,
          reason: "Already billed in current cycle (Idempotency safeguard).",
        });
        continue;
      }

      // Check plan autoClose policy: if expired, mark closed
      if (sub.plan.autoClose && sub.expiryDate && sub.expiryDate <= billingDate) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: "CLOSED" },
        });
        skippedSubscriptions.push({
          subscriptionNumber: sub.subscriptionNumber,
          reason: "Plan reached expiry date and auto-closed as per plan policy.",
        });
        continue;
      }

      invoiceCount++;
      const invoiceNumber = `INV-${billingDate.getFullYear()}-${String(invoiceCount).padStart(4, "0")}`;

      // Calculate due date based on payment terms
      const dueDate = new Date(billingDate);
      if (sub.paymentTerms === "IMMEDIATE") {
        dueDate.setDate(dueDate.getDate());
      } else if (sub.paymentTerms === "NET15") {
        dueDate.setDate(dueDate.getDate() + 15);
      } else {
        dueDate.setDate(dueDate.getDate() + 30); // Default Net 30
      }

      // Process invoice lines
      let subtotal = 0;
      let totalTax = 0;
      let totalDiscount = 0;
      const invoiceLinesData = [];

      for (const line of sub.lines) {
        const lineBase = (line.unitPrice + line.variantSurcharge) * line.quantity;
        subtotal += lineBase;

        // Check if there are product-specific discounts
        const lineDiscountRule = activeDiscounts.find(
          (d) =>
            d.appliesTo === "PRODUCT" &&
            d.targetProductId === line.productId &&
            (!d.minQuantity || line.quantity >= d.minQuantity) &&
            (!d.usageLimit || d.timesUsed < d.usageLimit)
        );

        let lineDiscountAmount = 0;
        if (lineDiscountRule) {
          if (lineDiscountRule.type === "PERCENTAGE") {
            lineDiscountAmount = (lineBase * lineDiscountRule.value) / 100;
          } else {
            lineDiscountAmount = Math.min(lineDiscountRule.value, lineBase);
          }
          // Increment discount timesUsed
          await prisma.discountRule.update({
            where: { id: lineDiscountRule.id },
            data: { timesUsed: { increment: 1 } },
          });
        }

        totalDiscount += lineDiscountAmount;
        const taxableLineAmount = lineBase - lineDiscountAmount;
        const lineTax = (taxableLineAmount * (line.taxRate || defaultTaxRate)) / 100;
        totalTax += lineTax;

        invoiceLinesData.push({
          productId: line.productId,
          variantId: line.variantId,
          description: `${line.product.name}${line.variant ? ` (${line.variant.name})` : ""}`,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          variantSurcharge: line.variantSurcharge,
          subtotal: lineBase,
          discountAmount: lineDiscountAmount,
          taxAmount: lineTax,
          total: taxableLineAmount + lineTax,
        });
      }

      // Check whole-subscription discounts
      const subDiscountRule = activeDiscounts.find(
        (d) =>
          d.appliesTo === "SUBSCRIPTION" &&
          (!d.minPurchaseAmount || subtotal >= d.minPurchaseAmount) &&
          (!d.usageLimit || d.timesUsed < d.usageLimit)
      );

      if (subDiscountRule) {
        let subDiscountAmt = 0;
        if (subDiscountRule.type === "PERCENTAGE") {
          subDiscountAmt = (subtotal * subDiscountRule.value) / 100;
        } else {
          subDiscountAmt = Math.min(subDiscountRule.value, subtotal);
        }
        totalDiscount += subDiscountAmt;

        await prisma.discountRule.update({
          where: { id: subDiscountRule.id },
          data: { timesUsed: { increment: 1 } },
        });
      }

      const totalAmount = subtotal - totalDiscount + totalTax;

      // Create Invoice
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          subscriptionId: sub.id,
          customerId: sub.customerId,
          status: "DRAFT", // Moves Draft -> Confirmed -> Paid
          issueDate: billingDate,
          dueDate,
          periodStart,
          periodEnd,
          subtotal,
          discountAmount: totalDiscount,
          taxAmount: totalTax,
          totalAmount,
          paidAmount: 0.0,
          balanceDue: totalAmount,
          notes: `Automated recurring cycle invoice generated for ${sub.subscriptionNumber}. Terms: ${sub.paymentTerms}.`,
          lines: {
            create: invoiceLinesData,
          },
        },
        include: {
          customer: true,
          lines: true,
        },
      });

      // Advance subscription's nextBillingDate
      const nextBilling = new Date(billingDate);
      if (sub.plan.frequency === "DAILY") nextBilling.setDate(nextBilling.getDate() + 1);
      else if (sub.plan.frequency === "WEEKLY") nextBilling.setDate(nextBilling.getDate() + 7);
      else if (sub.plan.frequency === "MONTHLY") nextBilling.setMonth(nextBilling.getMonth() + 1);
      else if (sub.plan.frequency === "YEARLY") nextBilling.setFullYear(nextBilling.getFullYear() + 1);

      await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          lastBilledDate: billingDate,
          nextBillingDate: nextBilling,
        },
      });

      generatedInvoices.push({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        subscriptionNumber: sub.subscriptionNumber,
        customerName: sub.customer.name,
        totalAmount: invoice.totalAmount,
      });
    }

    return NextResponse.json({
      success: true,
      processedCount: subscriptions.length,
      generatedCount: generatedInvoices.length,
      skippedCount: skippedSubscriptions.length,
      invoices: generatedInvoices,
      skipped: skippedSubscriptions,
      message: `Billing run finished: ${generatedInvoices.length} invoices generated, ${skippedSubscriptions.length} skipped.`,
    });
  } catch (error: any) {
    console.error("Billing run error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute billing run" },
      { status: 500 }
    );
  }
}

