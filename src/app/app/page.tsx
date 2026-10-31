import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Briefcase, FileText, Layers, TrendingUp, Receipt, ArrowRight, LineChart } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StaffOperationsPage() {
  const user = await getCurrentUser();

  const [activeQuotes, activeSubs, draftInvoices] = await Promise.all([
    prisma.subscription.count({ where: { status: "QUOTATION" } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.invoice.count({ where: { status: "DRAFT" } }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 mb-2">
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              Staff Operations Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Hello, {user?.name || "Staff Member"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage quotes, process customer subscriptions, issue invoices, and record payments.
            </p>
          </div>

          <Link
            href="/app/subscriptions"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-xs flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Manage Subscriptions
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs uppercase font-semibold">Active Subscriptions</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{activeSubs} Active</div>
            <div className="text-xs text-slate-500 mt-1">Earning recurring monthly revenue</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs uppercase font-semibold">Pending Quotes</span>
              <FileText className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{activeQuotes} Quotes</div>
            <div className="text-xs text-slate-500 mt-1">Awaiting customer confirmation</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs uppercase font-semibold">Draft Invoices</span>
              <Receipt className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{draftInvoices} Invoices</div>
            <div className="text-xs text-slate-500 mt-1">Ready for confirmation & dispatch</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/app/subscriptions"
            className="p-5 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 shadow-xs transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 border border-blue-100">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Subscriptions & Quotes</h3>
              <p className="text-xs text-slate-500 mt-1">Create quotes from templates and advance lifecycle states.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 mt-4">
              Open Subscriptions <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/app/invoices"
            className="p-5 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 shadow-xs transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-100">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Invoicing & Payments</h3>
              <p className="text-xs text-slate-500 mt-1">Review generated invoices and log customer payments.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-4">
              Open Invoices <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/app/catalog"
            className="p-5 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 shadow-xs transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 border border-indigo-100">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Product Catalog</h3>
              <p className="text-xs text-slate-500 mt-1">Browse active plans, pricing tiers, and variant add-ons.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 mt-4">
              View Catalog <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
