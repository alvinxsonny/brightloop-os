import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Shield, Users, Layers, Receipt, ArrowRight, TrendingUp, LineChart } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 mb-2">
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              Administrator Control Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome, {user?.name || "Admin"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure products, plans, tax & discount rules, and oversee operations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/staff"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-xs flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Manage Staff ({staffCount})
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs uppercase font-semibold">Active Staff</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{staffCount} members</div>
            <div className="text-xs text-slate-500 mt-1">Authorized internal operators</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs uppercase font-semibold">Catalog</span>
              <Layers className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{productCount} Products</div>
            <div className="text-xs text-slate-500 mt-1">{planCount} Billing Plans configured</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs uppercase font-semibold">Subscriptions</span>
              <TrendingUp className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{subscriptionCount} Contracts</div>
            <div className="text-xs text-slate-500 mt-1">Across all lifecycle stages</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs uppercase font-semibold">Invoices</span>
              <Receipt className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{invoiceCount} Generated</div>
            <div className="text-xs text-slate-500 mt-1">Automated recurring billing</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/admin/staff"
            className="p-5 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 shadow-xs transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 border border-purple-100">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Provision Staff</h3>
              <p className="text-xs text-slate-500 mt-1">Only the admin can add internal staff members.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 mt-4">
              Open Staff Management <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/app/subscriptions"
            className="p-5 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 shadow-xs transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 border border-indigo-100">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">View Subscriptions</h3>
              <p className="text-xs text-slate-500 mt-1">Inspect and manage live subscriptions and quotes.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 mt-4">
              Explore Subscriptions <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/app/finance"
            className="p-5 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 shadow-xs transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-100">
                <LineChart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Finance Lead Hub</h3>
              <p className="text-xs text-slate-500 mt-1">MRR, ARR, cash collection, and overdue invoice aging.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-4">
              Open Finance Console <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
