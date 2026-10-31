import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "brightloop-super-secret-jwt-key-2026";
export const TOKEN_COOKIE_NAME = "brightloop_token";

export interface PasswordValidationResult {
  isValid: boolean;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasSpecialChar: boolean;
  errors: string[];
}

/**
 * Validates password against Brightloop security criteria:
 * - Length > 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one special character
 */
export function validatePassword(password: string): PasswordValidationResult {
  const hasMinLength = password.length > 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

  const errors: string[] = [];
  if (!hasMinLength) errors.push("Password must be more than 8 characters long.");
  if (!hasUppercase) errors.push("Password must contain at least one uppercase letter.");
  if (!hasLowercase) errors.push("Password must contain at least one lowercase letter.");
  if (!hasSpecialChar) errors.push("Password must contain at least one special character.");

  return {
    isValid: hasMinLength && hasUppercase && hasLowercase && hasSpecialChar,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasSpecialChar,
    errors,
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { id: string; email: string; role: string; name: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { id: string; email: string; role: string; name: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; name: string };
  } catch {
    return null;
  }
}

/**
 * Retrieves the currently authenticated user from cookies in server components / route handlers.
 */
export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload?.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        company: true,
        phone: true,
        address: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error retrieving current user:", error);
    return null;
  }
}
