import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Repeat, Layers, BarChart3, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col justify-between">
      {/* Navigation */}
      <header className="border-b border-slate-700/60 bg-slate-900/50 backdrop-blur sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Repeat className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                BrightLoop OS
              </span>
              <span className="block text-xs text-indigo-300 font-medium">Autonomous Recurring Billing</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white transition rounded-lg hover:bg-slate-800"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              Launch Platform
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 flex-1 flex flex-col justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold mb-6 mx-auto">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          Brightloop Software Operational Backbone
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
          The Autonomous Subscription &{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
            Recurring Billing Platform
          </span>
        </h1>

        <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          From quote templates and dynamic product variants to zero-touch billing runs, receivable collections, and sub-2s executive analytics.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            href="/login"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition hover:scale-[1.02]"
          >
            Access Live Environment
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/register"
            className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold transition hover:scale-[1.02]"
          >
            Create Customer Account
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-white mb-2">Dynamic Product Variants & Plans</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Configure daily, weekly, monthly, and yearly recurring plans with variant surcharges (e.g. +$560 Odoo brand integration).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-white mb-2">Automated Billing Engine</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Zero-touch billing cycles generate exact invoices with taxes, discount rules, and strict idempotency protection.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur">
            <div className="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-white mb-2">Sub-2s Finance Intelligence</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Real-time MRR, ARR, overdue receivables tracking, and cohort retention metrics built for immediate financial control.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        BrightLoop OS &copy; {new Date().getFullYear()} Brightloop Software. Autonomous Billing System.
      </footer>
    </div>
  );
}

