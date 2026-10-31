import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const startTime = performance.now();

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ADMIN" && user.role !== "STAFF") {
      return NextResponse.json({ error: "Forbidden: Executive Finance access requires Admin or Staff privileges" }, { status: 403 });
    }

    const now = new Date();

    // Fetch core financial entities in parallel for maximum sub-second speed
    const [subscriptions, invoices, recentPayments, plans, customers] = await Promise.all([
      prisma.subscription.findMany({
        include: {
          plan: true,
          customer: {
            select: { id: true, name: true, email: true, company: true },
          },
        },
      }),
      prisma.invoice.findMany({
        include: {
          customer: {
            select: { id: true, name: true, email: true, company: true },
          },
          subscription: {
            include: { plan: true },
          },
          payments: {
            orderBy: { paymentDate: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.findMany({
        take: 10,
        orderBy: { paymentDate: "desc" },
        include: {
          invoice: {
            select: {
              invoiceNumber: true,
              customer: { select: { name: true, company: true } },
            },
          },
        },
      }),
      prisma.plan.findMany({
        include: {
          _count: {
            select: { subscriptions: true },
          },
        },
      }),
      prisma.user.findMany({
        where: { role: "CUSTOMER" },
        select: { id: true, name: true, email: true, company: true },
      }),
    ]);

    // 1. Calculate MRR & ARR
    let mrr = 0;
    let activeSubCount = 0;
    let pausedSubCount = 0;
    let closedSubCount = 0;
    let quotationSubCount = 0;
    let draftSubCount = 0;
    let confirmedSubCount = 0;

    const planStatsMap = new Map<string, { planId: string; name: string; frequency: string; count: number; mrr: number; totalRev: number }>();
    plans.forEach((p) => {
      planStatsMap.set(p.id, {
        planId: p.id,
        name: p.name,
        frequency: p.frequency,
        count: 0,
        mrr: 0,
        totalRev: 0,
      });
    });

    subscriptions.forEach((sub) => {
      const planFreq = sub.plan?.frequency || "MONTHLY";
      const total = sub.totalAmount || 0;

      if (sub.status === "ACTIVE") {
        activeSubCount++;
        let normalizedMonthly = 0;
        switch (planFreq) {
          case "DAILY":
            normalizedMonthly = total * 30;
            break;
          case "WEEKLY":
            normalizedMonthly = (total * 52) / 12;
            break;
          case "MONTHLY":
            normalizedMonthly = total;
            break;
          case "YEARLY":
            normalizedMonthly = total / 12;
            break;
          default:
            normalizedMonthly = total;
        }
        mrr += normalizedMonthly;

        if (sub.planId && planStatsMap.has(sub.planId)) {
          const entry = planStatsMap.get(sub.planId)!;
          entry.count++;
          entry.mrr += normalizedMonthly;
          entry.totalRev += total;
        }
      } else if (sub.status === "PAUSED") {
        pausedSubCount++;
      } else if (sub.status === "CLOSED") {
        closedSubCount++;
      } else if (sub.status === "QUOTATION") {
        quotationSubCount++;
      } else if (sub.status === "DRAFT") {
        draftSubCount++;
      } else if (sub.status === "CONFIRMED") {
        confirmedSubCount++;
      }
    });

    const arr = mrr * 12;
    const totalSubscriptions = subscriptions.length;
    const churnRate = totalSubscriptions > 0 ? (closedSubCount / totalSubscriptions) * 100 : 0;
    const pauseRate = totalSubscriptions > 0 ? (pausedSubCount / totalSubscriptions) * 100 : 0;

    // 2. Invoices & Receivables Analysis
    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let overdueCount = 0;
    let overdueAmount = 0;

    const agingBuckets = {
      days1to15: { count: 0, amount: 0 },
      days16to30: { count: 0, amount: 0 },
      days31to60: { count: 0, amount: 0 },
      daysOver60: { count: 0, amount: 0 },
    };

    const overdueList: any[] = [];
    const invoiceLedger: any[] = [];

    invoices.forEach((inv) => {
      const isCancelled = inv.status === "CANCELLED";
      const isPaid = inv.status === "PAID";
      const dueDate = new Date(inv.dueDate);
      const isPastDue = !isPaid && !isCancelled && dueDate < now && inv.balanceDue > 0;

      const diffTime = Math.max(0, now.getTime() - dueDate.getTime());
      const overdueDays = isPastDue ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;

      if (!isCancelled) {
        totalInvoiced += inv.totalAmount;
        totalCollected += inv.paidAmount;
        totalOutstanding += inv.balanceDue;
      }

      if (isPastDue) {
        overdueCount++;
        overdueAmount += inv.balanceDue;

        if (overdueDays <= 15) {
          agingBuckets.days1to15.count++;
          agingBuckets.days1to15.amount += inv.balanceDue;
        } else if (overdueDays <= 30) {
          agingBuckets.days16to30.count++;
          agingBuckets.days16to30.amount += inv.balanceDue;
        } else if (overdueDays <= 60) {
          agingBuckets.days31to60.count++;
          agingBuckets.days31to60.amount += inv.balanceDue;
        } else {
          agingBuckets.daysOver60.count++;
          agingBuckets.daysOver60.amount += inv.balanceDue;
        }

        overdueList.push({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          customerName: inv.customer?.name || "Customer",
          customerCompany: inv.customer?.company || "Independent",
          totalAmount: inv.totalAmount,
          balanceDue: inv.balanceDue,
          paidAmount: inv.paidAmount,
          dueDate: inv.dueDate,
          overdueDays,
          status: inv.status,
          planName: inv.subscription?.plan?.name || "Standard",
        });
      }

      invoiceLedger.push({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerId: inv.customerId,
        customerName: inv.customer?.name || "Customer",
        customerCompany: inv.customer?.company || "Independent",
        totalAmount: inv.totalAmount,
        paidAmount: inv.paidAmount,
        balanceDue: inv.balanceDue,
        status: inv.status,
        isOverdue: isPastDue,
        overdueDays,
        issueDate: inv.issueDate,
        dueDate: inv.dueDate,
        planName: inv.subscription?.plan?.name || "Custom Contract",
      });
    });

    const collectionRate =
      totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 100;

    // 3. Monthly Revenue Trend (Last 6 Months)
    const monthlyTrend: { month: string; invoiced: number; collected: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      let mInvoiced = 0;
      let mCollected = 0;

      invoices.forEach((inv) => {
        const invDate = new Date(inv.issueDate);
        if (invDate >= d && invDate < nextMonth && inv.status !== "CANCELLED") {
          mInvoiced += inv.totalAmount;
          mCollected += inv.paidAmount;
        }
      });

      monthlyTrend.push({
        month: monthLabel,
        invoiced: Math.round(mInvoiced * 100) / 100,
        collected: Math.round(mCollected * 100) / 100,
      });
    }

    // 4. Customer LTV & Outstanding Breakdown
    const customerLedger = customers.map((c) => {
      const cSubs = subscriptions.filter((s) => s.customerId === c.id);
      const cInvs = invoices.filter((i) => i.customerId === c.id && i.status !== "CANCELLED");

      const activeSubs = cSubs.filter((s) => s.status === "ACTIVE").length;
      const totalSpent = cInvs.reduce((acc, i) => acc + i.paidAmount, 0);
      const balanceDue = cInvs.reduce((acc, i) => acc + i.balanceDue, 0);

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        company: c.company || "Independent",
        activeSubscriptions: activeSubs,
        totalInvoiced: cInvs.reduce((acc, i) => acc + i.totalAmount, 0),
        totalPaid: totalSpent,
        balanceDue,
        status: balanceDue > 0 ? "OUTSTANDING" : "GOOD_STANDING",
      };
    }).sort((a, b) => b.totalPaid - a.totalPaid);

    const planDistribution = Array.from(planStatsMap.values()).map((p) => ({
      name: p.name,
      frequency: p.frequency,
      activeSubscribers: p.count,
      mrr: Math.round(p.mrr * 100) / 100,
      totalRevenue: Math.round(p.totalRev * 100) / 100,
    }));

    const executionTimeMs = Math.round(performance.now() - startTime);

    return NextResponse.json({
      success: true,
      performance: {
        executionTimeMs,
        meetsSlo: executionTimeMs < 2000,
        benchmarkTarget: "< 2000ms (< 2s)",
        timestamp: new Date().toISOString(),
      },
      kpis: {
        mrr: Math.round(mrr * 100) / 100,
        arr: Math.round(arr * 100) / 100,
        activeSubscriptions: activeSubCount,
        totalSubscriptions,
        pausedSubscriptions: pausedSubCount,
        closedSubscriptions: closedSubCount,
        quotationSubscriptions: quotationSubCount,
        churnRate: Math.round(churnRate * 10) / 10,
        pauseRate: Math.round(pauseRate * 10) / 10,
        totalInvoiced: Math.round(totalInvoiced * 100) / 100,
        totalCollected: Math.round(totalCollected * 100) / 100,
        totalOutstanding: Math.round(totalOutstanding * 100) / 100,
        collectionRate: Math.round(collectionRate * 10) / 10,
        overdueCount,
        overdueAmount: Math.round(overdueAmount * 100) / 100,
      },
      agingBuckets: [
        { label: "1–15 Days", ...agingBuckets.days1to15 },
        { label: "16–30 Days", ...agingBuckets.days16to30 },
        { label: "31–60 Days", ...agingBuckets.days31to60 },
        { label: "60+ Days", ...agingBuckets.daysOver60 },
      ],
      monthlyTrend,
      planDistribution,
      topCustomers: customerLedger.slice(0, 5),
      customerLedger,
      overdueList,
      invoiceLedger,
      recentPayments: recentPayments.map((p) => ({
        id: p.id,
        paymentNumber: p.paymentNumber,
        invoiceNumber: p.invoice?.invoiceNumber,
        customerName: p.invoice?.customer?.name,
        company: p.invoice?.customer?.company,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        paymentDate: p.paymentDate,
        transactionReference: p.transactionReference,
      })),
    });
  } catch (error: any) {
    console.error("Finance Analytics Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to aggregate financial analytics" },
      { status: 500 }
    );
  }
}
