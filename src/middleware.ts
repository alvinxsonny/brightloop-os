import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("brightloop_token")?.value;

  // Function to decode JWT payload without Node crypto dependencies in Edge runtime
  let userPayload: { id: string; email: string; role: string; name: string } | null = null;

  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], "base64").toString("utf-8");
        userPayload = JSON.parse(payloadJson);
      }
    } catch {
      userPayload = null;
    }
  }

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password");

  // If visiting auth pages while logged in, redirect to appropriate home
  if (isAuthPage && userPayload) {
    if (userPayload.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (userPayload.role === "STAFF") {
      return NextResponse.redirect(new URL("/app", request.url));
    }
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  // Admin routes: require ADMIN
  if (pathname.startsWith("/admin")) {
    if (!userPayload) {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url));
    }
    if (userPayload.role !== "ADMIN") {
      // If staff tries to access admin, send to staff app
      if (userPayload.role === "STAFF") {
        return NextResponse.redirect(new URL("/app", request.url));
      }
      return NextResponse.redirect(new URL("/portal", request.url));
    }
  }

  // Staff routes (/app): require STAFF or ADMIN
  if (pathname.startsWith("/app")) {
    if (!userPayload) {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url));
    }
    if (userPayload.role !== "STAFF" && userPayload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
  }

  // Customer portal routes (/portal): require login
  if (pathname.startsWith("/portal")) {
    if (!userPayload) {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/app/:path*",
    "/portal/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
