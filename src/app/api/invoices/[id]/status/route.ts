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
    if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const { action } = await req.json(); // "CONFIRM", "CANCEL"

    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    let newStatus = invoice.status;
    if (action === "CONFIRM") {
      newStatus = "CONFIRMED";
    } else if (action === "CANCEL") {
      newStatus = "CANCELLED";
    } else {
      return NextResponse.json({ error: `Unknown action '${action}'` }, { status: 400 });
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: { status: newStatus },
      include: {
        customer: true,
        lines: true,
      },
    });

    return NextResponse.json({
      success: true,
      invoice: updated,
      message: `Invoice marked as ${newStatus}.`,
    });
  } catch (error: any) {
    console.error("Update invoice status error:", error);
    return NextResponse.json({ error: "Failed to update invoice status" }, { status: 500 });
  }
}
