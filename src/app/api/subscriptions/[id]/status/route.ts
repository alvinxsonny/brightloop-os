import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { action, notes } = body; // action: "TO_QUOTATION", "CONFIRM", "ACTIVATE", "PAUSE", "RESUME", "CLOSE", "RENEW"

    const sub = await prisma.subscription.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!sub) {
      return NextResponse.json({ error: "Subscription not found." }, { status: 404 });
    }

    // Role checks
    // If customer, they can only pause/resume/close if the plan permits it and it belongs to them
    if (user.role === "CUSTOMER") {
      if (sub.customerId !== user.id) {
        return NextResponse.json({ error: "Access denied." }, { status: 403 });
      }

      if (action === "PAUSE" && !sub.plan.allowPause) {
        return NextResponse.json({ error: "This subscription plan does not permit pausing." }, { status: 400 });
      }
      if (action === "CLOSE" && !sub.plan.allowEarlyClose) {
        return NextResponse.json({ error: "This subscription plan does not permit early closure." }, { status: 400 });
      }
      if (action === "RENEW" && !sub.plan.allowRenew) {
        return NextResponse.json({ error: "This subscription plan does not permit self-renewal." }, { status: 400 });
      }
      if (!["PAUSE", "RESUME", "CLOSE", "RENEW"].includes(action)) {
        return NextResponse.json({ error: "Action not permitted for customer." }, { status: 403 });
      }
    }

    let newStatus = sub.status;
    let nextBillingDate = sub.nextBillingDate;
    let expiryDate = sub.expiryDate;

    switch (action) {
      case "TO_QUOTATION":
        newStatus = "QUOTATION";
        break;

      case "CONFIRM":
        newStatus = "CONFIRMED";
        break;

      case "ACTIVATE":
        newStatus = "ACTIVE";
        // When activated, ensure next billing date is set properly from today
        const now = new Date();
        const next = new Date(now);
        if (sub.plan.frequency === "DAILY") next.setDate(next.getDate() + 1);
        else if (sub.plan.frequency === "WEEKLY") next.setDate(next.getDate() + 7);
        else if (sub.plan.frequency === "MONTHLY") next.setMonth(next.getMonth() + 1);
        else if (sub.plan.frequency === "YEARLY") next.setFullYear(next.getFullYear() + 1);
        nextBillingDate = next;
        break;

      case "PAUSE":
        if (!sub.plan.allowPause && user.role !== "ADMIN") {
          return NextResponse.json({ error: "Pausing is disallowed by plan policy." }, { status: 400 });
        }
        newStatus = "PAUSED";
        break;

      case "RESUME":
        newStatus = "ACTIVE";
        break;

      case "CLOSE":
        if (!sub.plan.allowEarlyClose && user.role !== "ADMIN") {
          return NextResponse.json({ error: "Early closure is disallowed by plan policy." }, { status: 400 });
        }
        newStatus = "CLOSED";
        break;

      case "RENEW":
        if (!sub.plan.allowRenew && user.role !== "ADMIN") {
          return NextResponse.json({ error: "Renewal is disallowed by plan policy." }, { status: 400 });
        }
        newStatus = "ACTIVE";
        // Extend expiry date by 1 year or 1 month
        const currentExp = sub.expiryDate || new Date();
        const extended = new Date(currentExp);
        if (sub.plan.frequency === "YEARLY") {
          extended.setFullYear(extended.getFullYear() + 1);
        } else {
          extended.setMonth(extended.getMonth() + 1);
        }
        expiryDate = extended;
        break;

      default:
        return NextResponse.json({ error: `Invalid action '${action}'.` }, { status: 400 });
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: {
        status: newStatus,
        nextBillingDate,
        expiryDate,
        notes: notes ? `${sub.notes ? sub.notes + " | " : ""}${notes}` : sub.notes,
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

    return NextResponse.json({
      success: true,
      subscription: updated,
      message: `Subscription transitioned to ${newStatus}.`,
    });
  } catch (error: any) {
    console.error("State transition error:", error);
    return NextResponse.json({ error: "Failed to update subscription status." }, { status: 500 });
  }
}
