"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Repeat, LogOut, Shield, Briefcase, UserCheck, LineChart } from "lucide-react";

interface NavbarProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <Shield className="w-3 h-3 text-purple-600" />
            Admin
          </span>
        );
      case "STAFF":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Briefcase className="w-3 h-3 text-blue-600" />
            Staff
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserCheck className="w-3 h-3 text-emerald-600" />
            Customer
          </span>
        );
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-40 px-6 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Repeat className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              BrightLoop OS
            </span>
            <span className="hidden sm:block text-[10px] text-slate-500 font-medium">Brightloop Software</span>
          </div>
        </Link>

        {user && (
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            {user.role === "ADMIN" && (
              <>
                <Link
                  href="/admin"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname === "/admin" ? "bg-slate-100 text-slate-900 font-semibold" : "hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/app/subscriptions"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname.startsWith("/app/subscriptions") ? "bg-slate-100 text-slate-900 font-semibold" : "hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Subscriptions
                </Link>
                <Link
                  href="/app/invoices"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname.startsWith("/app/invoices") ? "bg-slate-100 text-slate-900 font-semibold" : "hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Invoices
                </Link>
                <Link
                  href="/app/catalog"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname.startsWith("/app/catalog") ? "bg-slate-100 text-slate-900 font-semibold" : "hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Catalog & Plans
                </Link>
                <Link
                  href="/admin/staff"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname === "/admin/staff" ? "bg-slate-100 text-slate-900 font-semibold" : "hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Staff Team
                </Link>
                <Link
                  href="/admin/rules"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname === "/admin/rules" ? "bg-slate-100 text-slate-900 font-semibold" : "hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Taxes & Discounts
                </Link>
                <Link
                  href="/app/finance"
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                    pathname.startsWith("/app/finance") ? "bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200" : "hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <LineChart className="w-3.5 h-3.5 text-indigo-600" />
                  Finance Hub
                </Link>
              </>
            )}

            {user.role === "STAFF" && (
              <>
                <Link
                  href="/app"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname === "/app" ? "bg-slate-100 text-slate-900 font-semibold" : "hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Operations
                </Link>
                <Link
                  href="/app/subscriptions"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname.startsWith("/app/subscriptions") ? "bg-slate-100 text-slate-900 font-semibold" : "hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Subscriptions
                </Link>
                <Link
                  href="/app/invoices"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname.startsWith("/app/invoices") ? "bg-slate-100 text-slate-900 font-semibold" : "hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Invoices
                </Link>
                <Link
                  href="/app/catalog"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname.startsWith("/app/catalog") ? "bg-slate-100 text-slate-900 font-semibold" : "hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Catalog
                </Link>
                <Link
                  href="/app/finance"
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                    pathname.startsWith("/app/finance") ? "bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200" : "hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <LineChart className="w-3.5 h-3.5 text-indigo-600" />
                  Finance Hub
                </Link>
              </>
            )}

            {user.role === "CUSTOMER" && (
              <>
                <Link
                  href="/portal"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname === "/portal" ? "bg-slate-100 text-slate-900 font-semibold" : "hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  My Subscriptions
                </Link>
                <Link
                  href="/portal/invoices"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname.startsWith("/portal/invoices") ? "bg-slate-100 text-slate-900 font-semibold" : "hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  My Invoices
                </Link>
              </>
            )}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-900 leading-tight">{user.name}</span>
                <span className="text-xs text-slate-500">{user.email}</span>
              </div>
              {getRoleBadge(user.role)}
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
