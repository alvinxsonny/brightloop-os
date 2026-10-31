import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Shield, Users, Layers, Receipt, ArrowRight, TrendingUp, LineChart, Sliders } from "lucide-react";
import { prisma } from "@/lib/prisma";

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
    <div className="min-h-screen text-slate-900 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 md:pl-28">
        {/* Welcome Header */}
        <div className="p-6 rounded-3xl glass-panel mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 mb-2">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Administrator Control Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome, {user?.name || "Admin"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure products, plans, tax & discount rules, and oversee subscription operations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/staff"
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-md shadow-emerald-600/20 flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Manage Staff ({staffCount})
            </Link>
          </div>
        </div>

        {/* Bento KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="p-5 rounded-3xl glass-card relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs uppercase font-semibold text-slate-600">Active Staff</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{staffCount} members</div>
            <div className="text-xs text-slate-500 mt-1">Authorized internal operators</div>
          </div>

          <div className="p-5 rounded-3xl glass-card relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs uppercase font-semibold text-slate-600">Catalog</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{productCount} Products</div>
            <div className="text-xs text-slate-500 mt-1">{planCount} Billing Plans configured</div>
          </div>

          <div className="p-5 rounded-3xl glass-card relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs uppercase font-semibold text-slate-600">Contracts</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-800">{subscriptionCount} Active</div>
            <div className="text-xs text-slate-500 mt-1">Across all lifecycle stages</div>
          </div>

          <div className="p-5 rounded-3xl glass-card relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs uppercase font-semibold text-slate-600">Invoices</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{invoiceCount} Generated</div>
            <div className="text-xs text-slate-500 mt-1">Automated recurring billing</div>
          </div>
        </div>

        {/* Action Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <Link
            href="/admin/staff"
            className="p-6 rounded-3xl glass-card hover:border-emerald-500/40 transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 border border-purple-100">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Provision Staff</h3>
              <p className="text-xs text-slate-500 mt-1">Only the admin can add internal staff members.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 mt-4">
              Open Staff Management <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/rules"
            className="p-6 rounded-3xl glass-card hover:border-emerald-500/40 transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 border border-teal-100">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Tax & Discounts</h3>
              <p className="text-xs text-slate-500 mt-1">Configure automated 18% GST rules and volume discounts.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 mt-4">
              Configure Rules <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/app/subscriptions"
            className="p-6 rounded-3xl glass-card hover:border-emerald-500/40 transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-100">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Subscriptions</h3>
              <p className="text-xs text-slate-500 mt-1">Inspect and manage live subscriptions and quotes.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 mt-4">
              Explore Subscriptions <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/app/finance"
            className="p-6 rounded-3xl glass-card hover:border-emerald-500/40 transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-100">
                <LineChart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Finance Lead Hub</h3>
              <p className="text-xs text-slate-500 mt-1">MRR, ARR, cash collection, and overdue invoice aging.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 mt-4">
              Open Finance Console <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
