import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Shield, Users, Layers, Receipt, CreditCard, ArrowRight, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  const [staffCount, productCount, planCount, subscriptionCount, invoiceCount] = await Promise.all([
    prisma.user.count({ where: { role: "STAFF" } }),
    prisma.product.count(),
    prisma.plan.count(),
    prisma.subscription.count(),
    prisma.invoice.count(),
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1">
        {/* Welcome Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900 border border-purple-500/30 shadow-xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40 mb-2">
              <Shield className="w-3.5 h-3.5" />
              Administrator Control Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Welcome, {user?.name || "Admin"}</h1>
            <p className="text-sm text-slate-300 mt-1">
              Configure products, plans, tax & discount rules, and oversee the Brightloop platform.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/staff"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition shadow-lg shadow-purple-600/30 flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Manage Staff ({staffCount})
            </Link>
          </div>
        </div>

        {/* Quick Stat Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-semibold">Active Staff</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">{staffCount} members</div>
            <div className="text-xs text-slate-500 mt-1">Authorized internal operators</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-semibold">Catalog</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">{productCount} Products</div>
            <div className="text-xs text-slate-500 mt-1">{planCount} Billing Plans configured</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-semibold">Subscriptions</span>
              <TrendingUp className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-white">{subscriptionCount} Contracts</div>
            <div className="text-xs text-slate-500 mt-1">Across all lifecycle stages</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-semibold">Invoices</span>
              <Receipt className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">{invoiceCount} Generated</div>
            <div className="text-xs text-slate-500 mt-1">Automated recurring billing</div>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/admin/staff"
            className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition">Provision Staff</h3>
              <p className="text-xs text-slate-400 mt-1">Only the admin can add internal staff members.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-purple-400 mt-4">
              Open Staff Management <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/app/subscriptions"
            className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">View Subscriptions</h3>
              <p className="text-xs text-slate-400 mt-1">Inspect and manage live subscriptions and quotes.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-indigo-400 mt-4">
              Explore Subscriptions <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/app/invoices"
            className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">Billing & Invoices</h3>
              <p className="text-xs text-slate-400 mt-1">Track billing runs, tax rules, and payments.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 mt-4">
              Inspect Invoices <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
