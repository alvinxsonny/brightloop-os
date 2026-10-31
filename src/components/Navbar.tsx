"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Repeat,
  LogOut,
  Shield,
  Briefcase,
  UserCheck,
  LineChart,
  Receipt,
  Package,
  Users,
  Sliders,
  Home,
  Menu,
  X,
  CreditCard,
  Sparkles,
} from "lucide-react";
import CurrencySelector from "./CurrencySelector";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Shield className="w-3 h-3 text-purple-600" />
            Admin
          </span>
        );
      case "STAFF":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Briefcase className="w-3 h-3 text-emerald-600" />
            Staff
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            <UserCheck className="w-3 h-3 text-teal-600" />
            Customer
          </span>
        );
    }
  };

  // Define navigation items based on role
  const getNavLinks = () => {
    if (!user) {
      return [
        { label: "Home", href: "/", icon: <Home className="w-4 h-4" /> },
        { label: "Sign In", href: "/login", icon: <UserCheck className="w-4 h-4" /> },
        { label: "Register", href: "/register", icon: <Sparkles className="w-4 h-4" /> },
      ];
    }

    if (user.role === "ADMIN") {
      return [
        { label: "Overview", href: "/admin", icon: <Home className="w-4 h-4" />, active: pathname === "/admin" },
        { label: "Subscriptions", href: "/app/subscriptions", icon: <Repeat className="w-4 h-4" />, active: pathname.startsWith("/app/subscriptions") },
        { label: "Invoices", href: "/app/invoices", icon: <Receipt className="w-4 h-4" />, active: pathname.startsWith("/app/invoices") },
        { label: "Catalog & Plans", href: "/app/catalog", icon: <Package className="w-4 h-4" />, active: pathname.startsWith("/app/catalog") },
        { label: "Staff Team", href: "/admin/staff", icon: <Users className="w-4 h-4" />, active: pathname === "/admin/staff" },
        { label: "Taxes & Rules", href: "/admin/rules", icon: <Sliders className="w-4 h-4" />, active: pathname === "/admin/rules" },
        { label: "Finance Hub", href: "/app/finance", icon: <LineChart className="w-4 h-4" />, active: pathname.startsWith("/app/finance") },
      ];
    }

    if (user.role === "STAFF") {
      return [
        { label: "Operations", href: "/app", icon: <Home className="w-4 h-4" />, active: pathname === "/app" },
        { label: "Subscriptions", href: "/app/subscriptions", icon: <Repeat className="w-4 h-4" />, active: pathname.startsWith("/app/subscriptions") },
        { label: "Invoices", href: "/app/invoices", icon: <Receipt className="w-4 h-4" />, active: pathname.startsWith("/app/invoices") },
        { label: "Catalog", href: "/app/catalog", icon: <Package className="w-4 h-4" />, active: pathname.startsWith("/app/catalog") },
        { label: "Finance Hub", href: "/app/finance", icon: <LineChart className="w-4 h-4" />, active: pathname.startsWith("/app/finance") },
      ];
    }

    // CUSTOMER
    return [
      { label: "My Subscriptions", href: "/portal", icon: <Repeat className="w-4 h-4" />, active: pathname === "/portal" },
      { label: "My Invoices", href: "/portal/invoices", icon: <Receipt className="w-4 h-4" />, active: pathname.startsWith("/portal/invoices") },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* =========================================================================
          1. VERTICAL LEFT FLOATING PILL SIDEBAR (Desktop)
          - Centered icon alignment in resting phase (slim pill w-16)
          - Expands smoothly on hover to w-64 without wrapping glitches
          - Clean user avatar profile indicator
          ========================================================================= */}
      <aside className="hidden md:flex fixed left-5 top-1/2 -translate-y-1/2 z-50 group/sidebar">
        <div className="glass-pill rounded-3xl p-2 transition-all duration-300 ease-in-out w-16 group-hover/sidebar:w-64 shadow-xl shadow-emerald-950/8 flex flex-col justify-between max-h-[92vh] overflow-hidden">
          {/* Top Logo - ONLY logo.png with no border and no text */}
          <div className="flex items-center h-12 px-1">
            <Link
              href="/"
              className="flex items-center h-10 w-10 group-hover/sidebar:w-48 overflow-hidden transition-all duration-300 shrink-0 cursor-pointer"
              title="BrightLoop"
            >
              <img
                src="/logo.png"
                alt="BrightLoop"
                className="h-8 w-auto max-w-none object-contain mix-blend-multiply"
              />
            </Link>
          </div>

          {/* Nav Items */}
          <div className="my-3 space-y-1.5 overflow-y-auto overflow-x-hidden">
            {navLinks.map((item) => {
              const isActive = (item as any).active || pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group/item flex items-center h-10 px-1 rounded-xl text-xs transition cursor-pointer overflow-hidden ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-900 font-bold border border-emerald-500/30"
                      : "text-slate-600 hover:text-slate-900 hover:bg-emerald-50/70"
                  }`}
                  title={item.label}
                >
                  <div className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg transition-colors ${
                    isActive ? "text-emerald-700 font-bold" : "text-slate-500 group-hover/item:text-emerald-700"
                  }`}>
                    {item.icon}
                  </div>
                  <span className="ml-3 font-medium text-slate-800 whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="ml-auto mr-2 w-1.5 h-1.5 rounded-full bg-emerald-600 opacity-0 group-hover/sidebar:opacity-100 transition-opacity shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Bottom Actions: User Profile */}
          <div className="pt-2 border-t border-emerald-500/15">
            {user ? (
              <div className="flex items-center h-12 px-1">
                <div
                  className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border-2 border-white"
                  title={`${user.name} (${user.role})`}
                >
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="ml-3 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 overflow-hidden text-left flex-1 min-w-0">
                  <span className="text-xs font-semibold text-slate-900 block truncate leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate font-medium">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="ml-2 opacity-0 group-hover/sidebar:opacity-100 transition-opacity p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center h-10 px-1">
                <Link
                  href="/login"
                  className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs"
                  title="Sign In"
                >
                  <UserCheck className="w-4 h-4" />
                </Link>
                <div className="ml-3 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  <Link
                    href="/login"
                    className="text-xs font-semibold text-emerald-800 hover:underline"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* =========================================================================
          2. TOP GLASS BAR (Breadcrumbs & Global Controls)
          - Keeps content well spaced and provides quick actions on all viewports
          ========================================================================= */}
      <header className="glass-panel border-b border-emerald-500/10 sticky top-0 z-30 px-6 py-3.5 md:pl-28 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: ONLY the logo.png file with no border and no particular text */}
          <Link href="/" className="flex items-center cursor-pointer" title="BrightLoop">
            <img
              src="/logo.png"
              alt="BrightLoop"
              className="h-8 sm:h-9 w-auto object-contain mix-blend-multiply"
            />
          </Link>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Global Currency Selector */}
            <CurrencySelector />

            {user ? (
              <div className="flex items-center gap-2.5">
                {getRoleBadge(user.role)}
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl border border-transparent hover:border-rose-200 transition cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/50 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-emerald-500/10 mt-3 space-y-2 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {navLinks.map((item) => {
                const isActive = (item as any).active || pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition ${
                      isActive
                        ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            {user && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600">{user.email}</span>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="text-rose-600 font-semibold hover:underline cursor-pointer"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* =========================================================================
          3. SIGN OUT CONFIRMATION MODAL PROMPT
          ========================================================================= */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 max-w-sm w-full text-center relative animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-4 shadow-xs">
              <LogOut className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Sign Out Confirmation
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Are you sure you want to end your current session? You will be redirected to the sign-in page.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={loggingOut}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={loggingOut}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition shadow-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {loggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
