import Link from "next/link";
import { ArrowRight, Zap, Repeat, Layers, BarChart3, Users, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                BrightLoop OS
              </span>
              <span className="block text-xs text-indigo-600 font-medium">Subscription & Billing Platform</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition rounded-lg hover:bg-slate-100"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-xs transition flex items-center gap-1.5"
            >
              Launch Platform
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 flex-1 flex flex-col justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-6 mx-auto">
          <Zap className="w-3.5 h-3.5 text-indigo-600" />
          Brightloop Software Operational System
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
          The Subscription &{" "}
          <span className="text-indigo-600">
            Recurring Billing Platform
          </span>
        </h1>

        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          From quote templates and dynamic product variants to automated billing runs, receivable collections, and sub-second financial reporting.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm flex items-center gap-2 transition"
          >
            Access Live Platform
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium text-sm transition shadow-xs"
          >
            Create Customer Account
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-100">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900 mb-2">Dynamic Product Variants & Plans</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Define daily, weekly, monthly, and yearly recurring tiers with brand surcharges (e.g. Odoo brand +560) and lifecycle policies.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
              <Repeat className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900 mb-2">Zero-Touch Billing Runs</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Idempotent automated invoice generator with configurable tax rules and automatic volume discount applications.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900 mb-2">Executive Analytics</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Instant MRR, ARR, cash inflow, and overdue receivables reporting responding in milliseconds.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-white">
        BrightLoop OS • Built for Brightloop Software
      </footer>
    </div>
  );
}
