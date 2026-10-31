import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Briefcase, FileText, Layers, TrendingUp, Receipt, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 shadow-xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40 mb-2">
              <Briefcase className="w-3.5 h-3.5" />
              Staff Operations Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Hello, {user?.name || "Staff Member"}</h1>
            <p className="text-sm text-slate-300 mt-1">
              Manage quotes, process customer subscriptions, issue invoices, and record payments.
            </p>
          </div>

          <Link
            href="/app/subscriptions"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition shadow-lg shadow-blue-600/30 flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Manage Subscriptions
          </Link>
        </div>

        {/* Operational Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-semibold">Active Subscriptions</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">{activeSubs} Active</div>
            <div className="text-xs text-slate-500 mt-1">Earning recurring monthly revenue</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-semibold">Pending Quotes</span>
              <FileText className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">{activeQuotes} Quotes</div>
            <div className="text-xs text-slate-500 mt-1">Awaiting confirmation</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-semibold">Draft Invoices</span>
              <Receipt className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">{draftInvoices} Invoices</div>
            <div className="text-xs text-slate-500 mt-1">Ready for confirmation & dispatch</div>
          </div>
        </div>

        {/* Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/app/subscriptions"
            className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition">Subscriptions & Quotes</h3>
              <p className="text-xs text-slate-400 mt-1">Create quotes from templates and advance lifecycle states.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-blue-400 mt-4">
              Open Subscriptions <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">Invoicing & Payments</h3>
              <p className="text-xs text-slate-400 mt-1">Review generated invoices and log customer payments.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 mt-4">
              Open Invoices <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/app/catalog"
            className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">Product Catalog</h3>
              <p className="text-xs text-slate-400 mt-1">Browse active plans, pricing tiers, and variant add-ons.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-indigo-400 mt-4">
              View Catalog <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
