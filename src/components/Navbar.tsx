"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Repeat, LogOut, User as UserIcon, Shield, Briefcase, UserCheck } from "lucide-react";

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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Shield className="w-3 h-3" />
            Admin
          </span>
        );
      case "STAFF":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Briefcase className="w-3 h-3" />
            Staff
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <UserCheck className="w-3 h-3" />
            Customer
          </span>
        );
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-50 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Repeat className="w-4 h-4 text-white group-hover:rotate-180 transition-transform duration-500" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
              BrightLoop OS
            </span>
            <span className="hidden sm:block text-[10px] text-slate-400 font-medium">Brightloop Software</span>
          </div>
        </Link>

        {/* Dynamic Navigation Links based on role */}
        {user && (
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-300">
            {user.role === "ADMIN" && (
              <>
                <Link
                  href="/admin"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname === "/admin" ? "bg-slate-800 text-white font-semibold" : "hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/app/subscriptions"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname.startsWith("/app/subscriptions") ? "bg-slate-800 text-white font-semibold" : "hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  Subscriptions
                </Link>
                <Link
                  href="/app/invoices"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname.startsWith("/app/invoices") ? "bg-slate-800 text-white font-semibold" : "hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  Invoices
                </Link>
                <Link
                  href="/app/catalog"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname.startsWith("/app/catalog") ? "bg-slate-800 text-white font-semibold" : "hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  Catalog & Plans
                </Link>
                <Link
                  href="/app/finance"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname === "/app/finance" ? "bg-slate-800 text-white font-semibold" : "hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  Finance Lead
                </Link>
                <Link
                  href="/admin/staff"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname === "/admin/staff" ? "bg-slate-800 text-white font-semibold" : "hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  Staff Team
                </Link>
                <Link
                  href="/admin/rules"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname === "/admin/rules" ? "bg-slate-800 text-white font-semibold" : "hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  Taxes & Discounts
                </Link>
              </>
            )}

            {user.role === "STAFF" && (
              <>
                <Link
                  href="/app"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname === "/app" ? "bg-slate-800 text-white font-semibold" : "hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  Operations
                </Link>
                <Link
                  href="/app/finance"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname === "/app/finance" ? "bg-slate-800 text-white font-semibold" : "hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  Finance Lead
                </Link>
                <Link
                  href="/app/subscriptions"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname.startsWith("/app/subscriptions") ? "bg-slate-800 text-white font-semibold" : "hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  Subscriptions
                </Link>
                <Link
                  href="/app/invoices"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname.startsWith("/app/invoices") ? "bg-slate-800 text-white font-semibold" : "hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  Invoices
                </Link>
                <Link
                  href="/app/catalog"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname.startsWith("/app/catalog") ? "bg-slate-800 text-white font-semibold" : "hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  Catalog
                </Link>
              </>
            )}

            {user.role === "CUSTOMER" && (
              <>
                <Link
                  href="/portal"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname === "/portal" ? "bg-slate-800 text-white font-semibold" : "hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  My Subscriptions
                </Link>
                <Link
                  href="/portal/invoices"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    pathname.startsWith("/portal/invoices") ? "bg-slate-800 text-white font-semibold" : "hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  My Invoices
                </Link>
              </>
            )}
          </nav>
        )}

        {/* User profile / Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-white leading-tight">{user.name}</span>
                <span className="text-xs text-slate-400">{user.email}</span>
              </div>
              {getRoleBadge(user.role)}
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow transition"
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

