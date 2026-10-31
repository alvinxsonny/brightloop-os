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
    <div className="min-h-screen text-slate-900 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 md:pl-28">
        <div className="p-6 rounded-3xl glass-panel mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 mb-2">
              <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
              Staff Operations Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Hello, {user?.name || "Staff Member"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage quotes, process customer subscriptions, issue invoices, and record payments.
            </p>
          </div>

          <Link
            href="/app/subscriptions"
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-md shadow-emerald-600/20 flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Manage Subscriptions
          </Link>
        </div>

        {/* Bento KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="p-6 rounded-3xl glass-card relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs uppercase font-semibold text-slate-600">Active Subscriptions</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-800">{activeSubs} Active</div>
            <div className="text-xs text-slate-500 mt-1">Earning recurring revenue</div>
          </div>

          <div className="p-6 rounded-3xl glass-card relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs uppercase font-semibold text-slate-600">Pending Quotes</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-700">{activeQuotes} Quotes</div>
            <div className="text-xs text-slate-500 mt-1">Awaiting customer confirmation</div>
          </div>

          <div className="p-6 rounded-3xl glass-card relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs uppercase font-semibold text-slate-600">Draft Invoices</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">{draftInvoices} Invoices</div>
            <div className="text-xs text-slate-500 mt-1">Ready for confirmation & dispatch</div>
          </div>
        </div>

        {/* Bento Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <Link
            href="/app/subscriptions"
            className="p-6 rounded-3xl glass-card hover:border-emerald-500/40 transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-100">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Subscriptions & Quotes</h3>
              <p className="text-xs text-slate-500 mt-1">Create quotes from templates and advance lifecycle states.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 mt-4">
              Open Subscriptions <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/app/invoices"
            className="p-6 rounded-3xl glass-card hover:border-emerald-500/40 transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 border border-teal-100">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Invoicing & Payments</h3>
              <p className="text-xs text-slate-500 mt-1">Review generated invoices and log customer payments.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 mt-4">
              Open Invoices <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/app/catalog"
            className="p-6 rounded-3xl glass-card hover:border-emerald-500/40 transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-100">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Product Catalog</h3>
              <p className="text-xs text-slate-500 mt-1">Browse active plans, pricing tiers, and variant add-ons.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 mt-4">
              View Catalog <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/app/finance"
            className="p-6 rounded-3xl glass-card hover:border-emerald-500/40 transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 border border-teal-100">
                <LineChart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Finance Console</h3>
              <p className="text-xs text-slate-500 mt-1">Executive MRR, ARR, and receivables aging metrics.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 mt-4">
              Open Finance <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
