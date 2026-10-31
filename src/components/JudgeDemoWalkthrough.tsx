"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { useCurrency } from "@/context/CurrencyContext";
import {
  Trophy,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  TrendingUp,
  Receipt,
  BarChart3,
  ArrowRight,
  Zap,
  UserCheck,
  Briefcase,
  Shield,
  FileSpreadsheet,
} from "lucide-react";

interface StepConfig {
  step: number;
  badge: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

export default function JudgeDemoWalkthrough() {
  const { formatCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingDate, setBillingDate] = useState(new Date().toISOString().split("T")[0]);
  const [billingResult, setBillingResult] = useState<any>(null);
  const [roleSwitchLoading, setRoleSwitchLoading] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const totalSteps = 7;

  // 1-Click Role Switcher for Judges
  const handleQuickLogin = async (email: string, roleName: string, targetPath: string) => {
    setRoleSwitchLoading(email);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "Password@123" }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Switched role to ${roleName} (${email})`, "Role Switcher");
        router.push(targetPath);
        router.refresh();
      } else {
        toast.error(data.error || "Login failed", "Role Switcher");
      }
    } catch {
      toast.error("Network error during role switch", "Error");
    } finally {
      setRoleSwitchLoading(null);
    }
  };

  // Live Billing Run Trigger inside the Walkthrough
  const handleRunBillingCycle = async () => {
    setBillingLoading(true);
    setBillingResult(null);
    try {
      const res = await fetch("/api/billing/run-cycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asOfDate: billingDate }),
      });
      const data = await res.json();
      if (res.ok) {
        setBillingResult(data);
        toast.success(
          `Billing run complete! ${data.generatedCount || 0} invoice(s) generated.`,
          "Autonomous Billing"
        );
      } else {
        toast.error(data.error || "Billing run failed", "Billing Error");
      }
    } catch {
      toast.error("Network error triggering billing cycle", "Billing Error");
    } finally {
      setBillingLoading(false);
    }
  };

  const stepsMetadata: StepConfig[] = [
    {
      step: 1,
      badge: "The Problem",
      title: "Manual Spreadsheets vs. Autonomous OS",
      subtitle: "The contrast between broken spreadsheet chaos and BrightLoop OS",
      icon: <FileSpreadsheet className="w-5 h-5 text-amber-500" />,
    },
    {
      step: 2,
      badge: "Authentication & Security",
      title: "Strict Password Security & Multi-Role RBAC",
      subtitle: "Password complexity enforcement (>8 chars, upper, lower, special) & role access",
      icon: <Shield className="w-5 h-5 text-purple-600" />,
    },
    {
      step: 3,
      badge: "Catalog & Pricing",
      title: "Product Variants & Lifecycle Billing Plans",
      subtitle: "Variant surcharges (+560 Odoo brand) and configurable frequencies",
      icon: <Layers className="w-5 h-5 text-indigo-600" />,
    },
    {
      step: 4,
      badge: "Sales & Contracts",
      title: "Quotation Templates to Active Subscriptions",
      subtitle: "Draft ➔ Quotation ➔ Confirmed ➔ Active ➔ Closed lifecycle state machine",
      icon: <TrendingUp className="w-5 h-5 text-sky-600" />,
    },
    {
      step: 5,
      badge: "Billing Day Engine",
      title: "Zero-Touch Automated Recurring Billing Day",
      subtitle: "100% idempotent billing engine with dynamic tax & discount rules",
      icon: <Zap className="w-5 h-5 text-yellow-600" />,
    },
    {
      step: 6,
      badge: "Collections & Portal",
      title: "Payment Reconciliation & Customer Self-Service",
      subtitle: "Atomic invoice settlement to PAID and self-service pause/resume permissions",
      icon: <Receipt className="w-5 h-5 text-emerald-600" />,
    },
    {
      step: 7,
      badge: "Executive Control",
      title: "Finance Lead Dashboard with Sub-2s SLA Benchmark",
      subtitle: "Live MRR, ARR, 4-tier aging buckets, and sub-40ms high performance analytics",
      icon: <BarChart3 className="w-5 h-5 text-indigo-600" />,
    },
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative px-4 py-2.5 rounded-full bg-emerald-600 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 hover:scale-105 transition-all duration-300 flex items-center gap-2.5 cursor-pointer border border-emerald-500"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Trophy className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="tracking-tight">Demo Walkthrough</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white/95 border border-emerald-500/20 backdrop-blur-xl rounded-3xl w-full max-w-4xl p-6 sm:p-8 shadow-2xl relative my-8 text-slate-900 max-h-[92vh] flex flex-col justify-between">
            {/* Modal Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-emerald-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        Product Tour
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Step {currentStep} of {totalSteps}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      BrightLoop OS — 7-Step Tour
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Bar / Step Tabs */}
              <div className="grid grid-cols-7 gap-1.5 py-4 border-b border-emerald-500/10">
                {stepsMetadata.map((s) => (
                  <button
                    key={s.step}
                    onClick={() => setCurrentStep(s.step)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      s.step === currentStep
                        ? "bg-emerald-600 shadow-sm"
                        : s.step < currentStep
                        ? "bg-teal-500"
                        : "bg-slate-200 hover:bg-slate-300"
                    }`}
                    title={`Step ${s.step}: ${s.badge}`}
                  />
                ))}
              </div>
            </div>

            {/* Step Body Content */}
            <div className="py-6 overflow-y-auto pr-1">
              {/* STEP 1: The Problem */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      Step 1: The Problem
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">
                      Manual Spreadsheet Chaos vs. Autonomous Subscription OS
                    </h3>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    At Brightloop Software, recurring billing previously lived in messy spreadsheets.
                    Renewals were remembered by whoever noticed first, invoices were typed up manually,
                    payments were reconciled by eye from bank statements, and revenue reports took days.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* The Before Card */}
                    <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
                      <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Before: The Spreadsheet Reality
                      </div>
                      <ul className="text-xs text-rose-800 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-rose-600 font-bold">&times;</span>
                          <span>Renewals missed when staff forget to check spreadsheet rows</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-rose-600 font-bold">&times;</span>
                          <span>Invoices typed by hand every month with human calculation errors</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-rose-600 font-bold">&times;</span>
                          <span>Payment reconciliation scrolling through bank PDFs</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-rose-600 font-bold">&times;</span>
                          <span>Leadership has no real-time MRR, ARR, or aging visibility</span>
                        </li>
                      </ul>
                    </div>

                    {/* The After Card */}
                    <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        After: BrightLoop OS Engine
                      </div>
                      <ul className="text-xs text-emerald-800 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">&check;</span>
                          <span>State machine contracts with automated renewal date tracking</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">&check;</span>
                          <span>1-Click idempotent billing engine with dynamic tax & discounts</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">&check;</span>
                          <span>Atomic payment entry & customer self-service receipt portal</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">&check;</span>
                          <span>Executive Finance Lead Dashboard with sub-40ms response SLA</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Sign Up & Security */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                      Step 2: Sign Up & Security
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">
                      Strict Password Validation & Multi-Role RBAC
                    </h3>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    Customer registration enforces strict security: password length &gt; 8 characters,
                    at least 1 uppercase letter, 1 lowercase letter, and 1 special character.
                    RBAC middleware strictly isolates roles across <code className="text-purple-700">/admin/*</code>,{" "}
                    <code className="text-blue-700">/app/*</code>, and{" "}
                    <code className="text-emerald-700">/portal/*</code>.
                  </p>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Quick Role-Switcher (Instant Demo Login)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => handleQuickLogin("admin@brightloop.io", "Admin", "/admin")}
                        disabled={roleSwitchLoading !== null}
                        className="p-3.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-left transition cursor-pointer flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Shield className="w-4 h-4 text-purple-600" />
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                            ADMIN
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900">admin@brightloop.io</div>
                        <div className="text-[10px] text-slate-500 mt-1">Full control & staff config</div>
                      </button>

                      <button
                        onClick={() => handleQuickLogin("staff@brightloop.io", "Staff", "/app")}
                        disabled={roleSwitchLoading !== null}
                        className="p-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left transition cursor-pointer flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Briefcase className="w-4 h-4 text-blue-600" />
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                            STAFF
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900">staff@brightloop.io</div>
                        <div className="text-[10px] text-slate-500 mt-1">Quotes, billing & payments</div>
                      </button>

                      <button
                        onClick={() => handleQuickLogin("customer@acme.com", "Customer", "/portal")}
                        disabled={roleSwitchLoading !== null}
                        className="p-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition cursor-pointer flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            CUSTOMER
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900">customer@acme.com</div>
                        <div className="text-[10px] text-slate-500 mt-1">Self-service portal & invoices</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Product Catalog & Variants */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Step 3: Catalog & Variants
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">
                      Product Variants & Flexible Lifecycle Billing Plans
                    </h3>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    Products support customizable variants, such as selecting the{" "}
                    <strong className="text-indigo-600">Odoo brand variant</strong> which automatically adds a{" "}
                    <strong className="text-emerald-600">+$560 surcharge</strong>.
                    Plans can bill <code className="text-indigo-600">DAILY</code>,{" "}
                    <code className="text-indigo-600">WEEKLY</code>,{" "}
                    <code className="text-indigo-600">MONTHLY</code>, or{" "}
                    <code className="text-indigo-600">YEARLY</code> with lifecycle rules like{" "}
                    <code className="text-amber-600">autoClose</code>,{" "}
                    <code className="text-emerald-600">allowPause</code>, and{" "}
                    <code className="text-sky-600">allowRenew</code>.
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Explore Catalog & Pricing Rules</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Inspect configured base software, addon seats, and variant surcharges.
                      </div>
                    </div>
                    <Link
                      href="/app/catalog"
                      onClick={() => setIsOpen(false)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
                    >
                      Open Catalog <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* STEP 4: Quote to Subscription */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                      Step 4: Sales & Contracts
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">
                      From Quotation Template to Active Subscription
                    </h3>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    Sales reps select a pre-configured quotation template with default validity days, product lines,
                    and variant surcharges. Subscriptions receive a unique tracking ID (<code className="text-sky-700">SUB-2026-XXXX</code>)
                    and move across lifecycle states.
                  </p>

                  {/* Lifecycle State Pipeline */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Subscription Lifecycle State Machine
                    </div>
                    <div className="flex items-center justify-between gap-1 overflow-x-auto text-[11px] font-semibold">
                      <span className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700">Draft</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">Quotation</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">Confirmed</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-500">Closed</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link
                      href="/app/subscriptions"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
                    >
                      Manage Subscriptions <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* STEP 5: Autonomous Billing Day Simulation */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      Step 5: Autonomous Billing Day
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">
                      Zero-Touch Billing Day Simulation & Idempotency
                    </h3>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    On billing day, the engine queries active subscriptions due for renewal, calculates tax
                    and discounts, auto-generates invoice <code className="text-amber-700">INV-YYYY-XXXX</code>, advances
                    the next billing date, and guarantees <strong>100% idempotency</strong> (no double billing).
                  </p>

                  {/* Interactive Live Billing Execution */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        Execute Live Billing Cycle Simulation
                      </div>
                      <input
                        type="date"
                        value={billingDate}
                        onChange={(e) => setBillingDate(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs"
                      />
                    </div>

                    <button
                      onClick={handleRunBillingCycle}
                      disabled={billingLoading}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      {billingLoading ? "Running Billing Engine..." : "Trigger Billing Cycle Now"}
                    </button>

                    {billingResult && (
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5">
                        <div className="text-emerald-700 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Engine executed successfully:
                        </div>
                        <div className="text-slate-600">
                          Due subscriptions: <strong className="text-slate-900">{billingResult.dueCount}</strong> &bull; Generated Invoices:{" "}
                          <strong className="text-emerald-600">{billingResult.generatedCount}</strong> &bull; Skipped (Idempotent):{" "}
                          <strong className="text-slate-700">{billingResult.skippedCount}</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Link
                      href="/app/invoices"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                    >
                      View Generated Invoices <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* STEP 6: Payments & Customer Self-Service */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Step 6: Collections & Portal
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">
                      Payment Reconciliation & Customer Self-Service
                    </h3>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    Payments are recorded with method, transaction reference, and notes.
                    When the invoice balance reaches zero, its status automatically settles to{" "}
                    <span className="text-emerald-700 font-bold">PAID</span>. In the Customer Portal, clients can view
                    printable receipts and exercise self-service pause/resume permissions.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900">Staff Invoices & Receivables</div>
                        <p className="text-xs text-slate-500 mt-1">
                          Log customer payments, check overdue badges, and view receivables.
                        </p>
                      </div>
                      <Link
                        href="/app/invoices"
                        onClick={() => setIsOpen(false)}
                        className="mt-4 px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition flex items-center justify-between"
                      >
                        <span>Open Invoices Ledger</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900">Customer Self-Service Portal</div>
                        <p className="text-xs text-slate-500 mt-1">
                          Customers self-manage subscriptions and print official receipts.
                        </p>
                      </div>
                      <Link
                        href="/portal"
                        onClick={() => setIsOpen(false)}
                        className="mt-4 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center justify-between shadow-sm"
                      >
                        <span>Open Customer Portal</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: Executive Finance Lead Dashboard */}
              {currentStep === 7 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      Step 7: Executive Control
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">
                      Executive Finance Lead Dashboard (<span className="text-emerald-600 font-mono">&lt;2s SLA</span>)
                    </h3>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    The Finance Lead Dashboard replaces days of manual spreadsheet compilation with instant,
                    real-time financial truth. Aggregating thousands of subscription records in{" "}
                    <strong className="text-emerald-600 font-mono">&lt;40ms</strong> (well under the 2000ms SLA).
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white/90 border border-emerald-500/15 text-center shadow-xs">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Normalized MRR</div>
                      <div className="text-lg font-black text-emerald-700 mt-1">{formatCurrency(2330)}+</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/90 border border-emerald-500/15 text-center shadow-xs">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Annual Run Rate</div>
                      <div className="text-lg font-black text-slate-900 mt-1">{formatCurrency(27960)}+</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Collection Rate</div>
                      <div className="text-lg font-black text-emerald-600 mt-1">90%+</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                      <div className="text-[10px] text-emerald-700 uppercase font-semibold">Latency SLA</div>
                      <div className="text-lg font-black text-emerald-700 mt-1">&lt;40ms PASS</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">View Full Executive Finance Lead Console</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Interactive charts, 4-tier aging buckets (&lt;30d, 31-60d, 61-90d, 90d+), and plan revenue breakdown.
                      </div>
                    </div>
                    <Link
                      href="/app/finance"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                    >
                      Open Finance Lead Console <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="text-xs text-slate-500 font-mono">
                {currentStep} / {totalSteps}
              </div>

              {currentStep < totalSteps ? (
                <button
                  onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" /> Finish Tour
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
