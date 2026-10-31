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
          - Icon-only when not hovered (slim pill)
          - Expands smoothly on hover to show label text, branding & quick actions
          ========================================================================= */}
      <aside className="hidden md:flex fixed left-5 top-1/2 -translate-y-1/2 z-50 group/sidebar">
        <div className="glass-pill rounded-full p-2.5 transition-all duration-300 ease-in-out w-[62px] group-hover/sidebar:w-64 group-hover/sidebar:rounded-3xl shadow-xl shadow-emerald-950/8 flex flex-col justify-between max-h-[92vh] overflow-hidden">
          {/* Top Logo */}
          <div className="flex items-center gap-3 px-1 py-1">
            <Link
              href="/"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600 text-white shrink-0 shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition"
              title="BrightLoop OS"
            >
              <Repeat className="w-4 h-4" />
            </Link>
            <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
              <span className="font-bold text-sm tracking-tight text-slate-900 block leading-tight">
                BrightLoop OS
              </span>
              <span className="text-[10px] font-medium text-emerald-700 block">
                Subscription Engine
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <div className="my-4 space-y-1.5 overflow-y-auto overflow-x-hidden pr-0.5">
            {navLinks.map((item) => {
              const isActive = (item as any).active || pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-2.5 py-2.5 rounded-2xl text-xs transition cursor-pointer relative ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-900 font-bold border border-emerald-500/30 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-emerald-50/60"
                  }`}
                  title={item.label}
                >
                  <div className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-lg ${
                    isActive ? "text-emerald-700 font-bold" : "text-slate-500"
                  }`}>
                    {item.icon}
                  </div>
                  <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap font-medium text-slate-800">
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-emerald-600 opacity-0 group-hover/sidebar:opacity-100 transition-opacity" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Bottom Actions: Currency Selector & User / Logout */}
          <div className="pt-3 border-t border-emerald-500/15 flex flex-col gap-2">
            {/* Currency Selector */}
            <div className="flex items-center gap-2 px-1">
              <CurrencySelector compact />
              <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap text-[11px] text-slate-500 font-medium">
                Switch Currency
              </div>
            </div>

            {/* User Profile info */}
            {user ? (
              <div className="flex items-center justify-between gap-2 px-1 pt-1">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                    {user.name?.charAt(0) || "U"}
                  </div>
                  <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 overflow-hidden text-left">
                    <span className="text-xs font-semibold text-slate-900 block truncate">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity flex flex-col gap-1.5 px-1">
                <Link
                  href="/login"
                  className="w-full text-center py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                >
                  Sign In
                </Link>
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
          {/* Left Title / Location */}
          <div className="flex items-center gap-3">
            <Link href="/" className="md:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Repeat className="w-4 h-4" />
              </div>
              <span className="font-bold text-base tracking-tight text-slate-900">BrightLoop</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Brightloop Software OS
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">Cloudy White & Jade Edition</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Global Currency Selector */}
            <CurrencySelector />

            {user ? (
              <div className="flex items-center gap-2.5">
                {getRoleBadge(user.role)}
                <button
                  onClick={handleLogout}
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
                  onClick={handleLogout}
                  className="text-rose-600 font-semibold hover:underline"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
