import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      // Security best practice: don't reveal whether user exists
      return NextResponse.json({
        success: true,
        message: "If that email is registered, a password reset link has been dispatched.",
      });
    }

    // Invalidate existing unused tokens
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // Create new token valid for 1 hour
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const resetUrl = `/reset-password?token=${token}`;

    return NextResponse.json({
      success: true,
      message: "Password reset link generated successfully.",
      resetUrl,
      token,
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request." },
      { status: 500 }
    );
  }
}

