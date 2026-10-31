"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Repeat,
  Layers,
  BarChart3,
  Users,
  CheckCircle2,
  ShieldCheck,
  Receipt,
  UserCheck,
  Briefcase,
  Sliders,
  DollarSign,
  TrendingUp,
  Clock,
  Sparkles,
  Calculator,
  ChevronRight,
  Play,
  FileText,
} from "lucide-react";
import CurrencySelector from "@/components/CurrencySelector";
import { useCurrency } from "@/context/CurrencyContext";

export default function HomePage() {
  const { formatCurrency, currency } = useCurrency();

  // ROI Calculator interactive state
  const [subscribers, setSubscribers] = useState(150);
  const [avgContractValue, setAvgContractValue] = useState(120);

  const calculatedMRR = subscribers * avgContractValue;
  const calculatedARR = calculatedMRR * 12;
  const hoursSaved = Math.round(subscribers * 0.35);

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      {/* =========================================================================
          TOP NAVIGATION BAR
          ========================================================================= */}
      <header className="glass-panel sticky top-0 z-40 border-b border-emerald-500/15 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center cursor-pointer" title="BrightLoop">
            <img
              src="/logo.png"
              alt="BrightLoop"
              className="h-10 sm:h-11 w-auto object-contain mix-blend-multiply"
            />
          </Link>

          <div className="flex items-center gap-3">
            <CurrencySelector />

            <Link
              href="/login"
              className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/60 transition rounded-xl"
            >
              Sign In
            </Link>

            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/25 transition flex items-center gap-1.5"
            >
              Launch Platform
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================================
          HERO SECTION
          ========================================================================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 pt-12 pb-24">
        {/* Hero Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300/60 text-emerald-800 text-xs font-semibold mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Autonomous Recurring Billing Platform for Brightloop Software</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight mb-6">
            Turn Recurring Chaos Into{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              Pure Predictability
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
            Eliminate error-prone spreadsheets with an autonomous state machine: quote templates,
            variant surcharges (+560 Odoo), 100% idempotent billing runs, and sub-second financial reporting.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12">
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition hover:scale-105"
            >
              Access Live Console
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/register"
              className="px-6 py-3.5 rounded-2xl glass-card hover:bg-white text-slate-800 font-semibold text-sm transition shadow-sm hover:border-emerald-500/30"
            >
              Register Customer Account
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="p-3 rounded-2xl glass-card text-center">
              <div className="text-xs text-slate-500 uppercase font-semibold">Idempotency</div>
              <div className="text-xl font-bold text-emerald-700 mt-0.5">100% Guaranteed</div>
            </div>
            <div className="p-3 rounded-2xl glass-card text-center">
              <div className="text-xs text-slate-500 uppercase font-semibold">Finance Query SLA</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">&lt; 40ms High Speed</div>
            </div>
            <div className="p-3 rounded-2xl glass-card text-center">
              <div className="text-xs text-slate-500 uppercase font-semibold">Active Currency</div>
              <div className="text-xl font-bold text-emerald-700 mt-0.5">{currency} Mode</div>
            </div>
            <div className="p-3 rounded-2xl glass-card text-center">
              <div className="text-xs text-slate-500 uppercase font-semibold">Role Boundaries</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">3-Tier RBAC</div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BENTO GRID FEATURE SHOWCASE
            ========================================================================= */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Engineered as an Interconnected Bento Operating System
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Every component works seamlessly together without duplicate entry or data loss.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Autonomous Billing Day Engine (Large 2-col) */}
            <div className="md:col-span-2 p-8 rounded-3xl glass-card border border-emerald-500/20 relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Core Engine
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Repeat className="w-5 h-5" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Zero-Touch Autonomous Billing Run
              </h3>
              <p className="text-sm text-slate-600 max-w-xl mb-6 leading-relaxed">
                On each contract renewal date, the engine inspects active subscriptions, factors in automated tax rules
                and volume discount rules, advances the billing date, and issues itemized invoices with 100% idempotency.
              </p>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-mono font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">No Double Billing: </span>
                    <span className="text-slate-600">State machines prevent duplicate invoice generation</span>
                  </div>
                </div>
                <Link
                  href="/app/invoices"
                  className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 font-semibold hover:bg-emerald-100 transition shadow-xs flex items-center gap-1"
                >
                  Inspect Invoices <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Bento Card 2: Product Variants & Surcharges (1-col) */}
            <div className="p-8 rounded-3xl glass-card border border-emerald-500/20 flex flex-col justify-between group hover:shadow-xl transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-300">
                    Pricing Matrix
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Variant Surcharges (+560 Odoo)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Configurable software base products with dynamic variants (e.g. Odoo brand +{formatCurrency(560)} surcharge)
                  and recurring billing frequencies (Daily, Weekly, Monthly, Yearly).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Brightloop Core:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(450)}/mo</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>+ Odoo Brand Variant:</span>
                  <span>+{formatCurrency(560)}</span>
                </div>
              </div>
            </div>

            {/* Bento Card 3: Quotation State Machine (1-col) */}
            <div className="p-8 rounded-3xl glass-card border border-emerald-500/20 flex flex-col justify-between group hover:shadow-xl transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300">
                    Sales Pipeline
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Quotation Templates
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Sales reps select pre-populated quotation templates with auto-set payment terms, validity expiry,
                  and itemized line pricing.
                </p>
              </div>

              <div className="space-y-1 text-[11px] font-semibold text-slate-700">
                <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Draft ➔ Quotation ➔ Confirmed</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Active Contract ➔ Auto-Renewal</span>
                </div>
              </div>
            </div>

            {/* Bento Card 4: Executive Finance Lead Dashboard (Large 2-col) */}
            <div className="md:col-span-2 p-8 rounded-3xl glass-card border border-emerald-500/20 relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  High Performance SLA
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Executive Finance Console with Sub-2s SLA
              </h3>
              <p className="text-sm text-slate-600 max-w-xl mb-6 leading-relaxed">
                Real-time normalized MRR & ARR, 4-tier aging buckets (&lt;30d, 31-60d, 61-90d, 90d+),
                customer lifetime value tables, and CSV exports that aggregate thousands of records in under 40 milliseconds.
              </p>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Query Latency</div>
                  <div className="text-lg font-extrabold text-emerald-700 font-mono mt-0.5">&lt; 40ms</div>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Overdue Tracking</div>
                  <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">4-Tier Buckets</div>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Audit Ledger</div>
                  <div className="text-lg font-extrabold text-emerald-700 font-mono mt-0.5">1-Click CSV</div>
                </div>
              </div>
            </div>

            {/* Bento Card 5: Customer Self-Service Portal (1-col) */}
            <div className="p-8 rounded-3xl glass-card border border-emerald-500/20 flex flex-col justify-between group hover:shadow-xl transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Self-Service
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Client Self-Service Portal
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Empower customers to inspect contract terms, exercise pause/resume permissions, and download formal tax receipts.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 font-medium">
                Zero support tickets for invoice copies.
              </div>
            </div>

            {/* Bento Card 6: Enterprise Security & RBAC (1-col) */}
            <div className="p-8 rounded-3xl glass-card border border-emerald-500/20 flex flex-col justify-between group hover:shadow-xl transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
                    Governance
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Role-Based Security & Compliance
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Strict password complexity validation (&gt;8 chars, uppercase, lowercase, special symbols) with RBAC route protection.
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">ADMIN</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">STAFF</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">CUSTOMER</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            INTERACTIVE REVENUE & ROI CALCULATOR
            ========================================================================= */}
        <div className="mb-20 p-8 sm:p-12 rounded-3xl glass-card border border-emerald-500/20 shadow-xl">
          <div className="max-w-2xl mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 mb-2">
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              Interactive Impact Calculator
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Calculate Your Operational Predictability
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Adjust subscriber count and contract size to visualize projected recurring revenue in your selected currency.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                  <span>Active Subscribers</span>
                  <span className="text-emerald-700 text-base font-extrabold">{subscribers} contracts</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={2500}
                  step={10}
                  value={subscribers}
                  onChange={(e) => setSubscribers(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                  <span>Average Monthly Contract Value (USD base)</span>
                  <span className="text-emerald-700 text-base font-extrabold">{formatCurrency(avgContractValue)}/mo</span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={1200}
                  step={25}
                  value={avgContractValue}
                  onChange={(e) => setAvgContractValue(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Result Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-emerald-200 text-center shadow-xs overflow-hidden">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Projected MRR</span>
                <span className="text-lg sm:text-2xl font-black text-emerald-700 block mt-1 tabular-nums whitespace-nowrap truncate">
                  {formatCurrency(calculatedMRR)}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-emerald-200 text-center shadow-xs overflow-hidden">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Projected ARR</span>
                <span className="text-lg sm:text-2xl font-black text-slate-900 block mt-1 tabular-nums whitespace-nowrap truncate">
                  {formatCurrency(calculatedARR)}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-center shadow-xs overflow-hidden">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Hours Saved/Mo</span>
                <span className="text-lg sm:text-2xl font-black text-emerald-800 block mt-1 tabular-nums whitespace-nowrap truncate">
                  ~{hoursSaved} hrs
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            INSTANT DEMO ROLE SWITCHER
            ========================================================================= */}
        <div className="p-8 sm:p-10 rounded-3xl glass-card border border-emerald-500/20 text-center">
          <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
            Ready to Explore BrightLoop OS?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mb-8">
            Access the platform using any pre-configured role. Every account uses password: <code className="text-emerald-800 font-mono font-semibold">Password@123</code>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <Link
              href="/login"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 transition group cursor-pointer shadow-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">ADMIN</span>
              </div>
              <div className="text-sm font-bold text-slate-900">admin@brightloop.io</div>
              <div className="text-xs text-slate-500 mt-0.5">Staff governance & tax rules</div>
            </Link>

            <Link
              href="/login"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition group cursor-pointer shadow-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <Briefcase className="w-5 h-5 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">STAFF</span>
              </div>
              <div className="text-sm font-bold text-slate-900">staff@brightloop.io</div>
              <div className="text-xs text-slate-500 mt-0.5">Catalog, quotes & finance engine</div>
            </Link>

            <Link
              href="/login"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 transition group cursor-pointer shadow-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <UserCheck className="w-5 h-5 text-teal-600" />
                <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">CUSTOMER</span>
              </div>
              <div className="text-sm font-bold text-slate-900">customer@acme.com</div>
              <div className="text-xs text-slate-500 mt-0.5">Self-service pause & invoices</div>
            </Link>
          </div>
        </div>
      </main>

      {/* =========================================================================
          RICH FOOTER SECTION
          ========================================================================= */}
      <footer className="glass-panel border-t border-emerald-500/15 py-12 px-6 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-xs">
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <Link href="/" className="inline-block cursor-pointer" title="BrightLoop">
              <img
                src="/logo.png"
                alt="BrightLoop"
                className="h-9 w-auto object-contain mix-blend-multiply"
              />
            </Link>
            <p className="text-slate-500 leading-relaxed">
              Autonomous subscription management and recurring billing platform engineered specifically for Brightloop Software Inc.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational • Sub-40ms SLA
            </div>
          </div>

          {/* Col 2: Modules */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 uppercase tracking-wider block mb-2">Core Modules</span>
            <Link href="/app/catalog" className="text-slate-600 hover:text-emerald-700 block transition">
              Product & Variant Catalog
            </Link>
            <Link href="/app/subscriptions" className="text-slate-600 hover:text-emerald-700 block transition">
              Subscription Lifecycle Machine
            </Link>
            <Link href="/app/invoices" className="text-slate-600 hover:text-emerald-700 block transition">
              Automated Billing Day Engine
            </Link>
            <Link href="/app/finance" className="text-slate-600 hover:text-emerald-700 block transition">
              Executive Finance Console
            </Link>
            <Link href="/portal" className="text-slate-600 hover:text-emerald-700 block transition">
              Customer Self-Service Portal
            </Link>
          </div>

          {/* Col 3: Role Portals */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 uppercase tracking-wider block mb-2">Access & Security</span>
            <Link href="/login" className="text-slate-600 hover:text-emerald-700 block transition">
              Admin Governance Portal
            </Link>
            <Link href="/login" className="text-slate-600 hover:text-emerald-700 block transition">
              Staff Operations Console
            </Link>
            <Link href="/portal" className="text-slate-600 hover:text-emerald-700 block transition">
              Customer Invoicing Portal
            </Link>
            <Link href="/register" className="text-slate-600 hover:text-emerald-700 block transition">
              Strict Password Criteria Validation
            </Link>
            <span className="text-slate-500 block">RBAC Cookie Middleware</span>
          </div>

          {/* Col 4: Prominent Currencies */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 uppercase tracking-wider block mb-2">Currency Engine</span>
            <p className="text-slate-500 mb-2">
              Instant multi-currency conversion across all contracts, invoices, and executive financial ledgers:
            </p>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px] font-semibold">
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">USD ($)</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">EUR (€)</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">GBP (£)</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">INR (₹)</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">JPY (¥)</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">CAD (CA$)</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">AUD (A$)</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs gap-3">
          <div>
            © 2026 Brightloop Software Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Security Disclosures</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
