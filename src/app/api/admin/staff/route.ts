import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword, validatePassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied. Admin privileges required." }, { status: 403 });
    }

    const staffMembers = await prisma.user.findMany({
      where: {
        role: { in: ["STAFF", "ADMIN"] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ staffMembers });
  } catch (error: any) {
    console.error("Staff list error:", error);
    return NextResponse.json({ error: "Failed to fetch staff members." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Only the admin can add a new member of staff." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email address already exists." },
        { status: 409 }
      );
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      return NextResponse.json(
        {
          error: "Password does not meet security requirements.",
          details: passwordCheck.errors,
        },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newStaff = await prisma.user.create({
      data: {
        name,
        email: trimmedEmail,
        password: hashedPassword,
        role: "STAFF",
        phone: phone?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, staff: newStaff });
  } catch (error: any) {
    console.error("Create staff error:", error);
    return NextResponse.json(
      { error: "Failed to create staff member." },
      { status: 500 }
    );
  }
}
