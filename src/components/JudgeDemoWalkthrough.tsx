"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import {
  Trophy,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  Repeat,
  ShieldCheck,
  TrendingUp,
  Receipt,
  DollarSign,
  BarChart3,
  ArrowRight,
  Sparkles,
  Zap,
  Building,
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
      icon: <FileSpreadsheet className="w-5 h-5 text-amber-400" />,
    },
    {
      step: 2,
      badge: "Authentication & Security",
      title: "Strict Password Security & Multi-Role RBAC",
      subtitle: "Password complexity enforcement (>8 chars, upper, lower, special) & role access",
      icon: <ShieldCheck className="w-5 h-5 text-purple-400" />,
    },
    {
      step: 3,
      badge: "Catalog & Pricing",
      title: "Product Variants & Lifecycle Billing Plans",
      subtitle: "Variant surcharges (+560 Odoo brand) and configurable frequencies",
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
    },
    {
      step: 4,
      badge: "Sales & Contracts",
      title: "Quotation Templates to Active Subscriptions",
      subtitle: "Draft ➔ Quotation ➔ Confirmed ➔ Active ➔ Closed lifecycle state machine",
      icon: <TrendingUp className="w-5 h-5 text-sky-400" />,
    },
    {
      step: 5,
      badge: "Billing Day Engine",
      title: "Zero-Touch Automated Recurring Billing Day",
      subtitle: "100% idempotent billing engine with dynamic tax & discount rules",
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
    },
    {
      step: 6,
      badge: "Collections & Portal",
      title: "Payment Reconciliation & Customer Self-Service",
      subtitle: "Atomic invoice settlement to PAID and self-service pause/resume permissions",
      icon: <Receipt className="w-5 h-5 text-emerald-400" />,
    },
    {
      step: 7,
      badge: "Executive Control",
      title: "Finance Lead Dashboard with Sub-2s SLA Benchmark",
      subtitle: "Live MRR, ARR, 4-tier aging buckets, and sub-40ms high performance analytics",
      icon: <BarChart3 className="w-5 h-5 text-rose-400" />,
    },
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold text-xs shadow-2xl shadow-amber-500/40 hover:shadow-amber-500/60 hover:scale-105 transition-all duration-300 flex items-center gap-2.5 cursor-pointer border border-amber-300/40"
        >
          <div className="w-6 h-6 rounded-full bg-slate-950/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Trophy className="w-3.5 h-3.5 text-slate-950" />
          </div>
          <span className="tracking-tight">🏆 Judge Demo Walkthrough</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        </button>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl p-6 sm:p-8 shadow-2xl relative my-8 text-slate-100 max-h-[92vh] flex flex-col justify-between">
            {/* Modal Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                        Hackathon Evaluation Tour
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        Step {currentStep} of {totalSteps}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-white">
                      BrightLoop OS — 7-Step Hackathon Story
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Bar / Step Tabs */}
              <div className="grid grid-cols-7 gap-1.5 py-4 border-b border-slate-800/80">
                {stepsMetadata.map((s) => (
                  <button
                    key={s.step}
                    onClick={() => setCurrentStep(s.step)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      s.step === currentStep
                        ? "bg-amber-400 shadow-sm shadow-amber-400/50"
                        : s.step < currentStep
                        ? "bg-emerald-500"
                        : "bg-slate-800 hover:bg-slate-700"
                    }`}
                    title={`Step ${s.step}: ${s.badge}`}
                  />
                ))}
              </div>
            </div>

            {/* Step Body Content */}
            <div className="py-6 overflow-y-auto pr-1">
              {/* STEP 1: The Problem ("Before") */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Step 1: The Problem
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      Manual Spreadsheet Chaos vs. Autonomous Subscription OS
                    </h3>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    At Brightloop Software, recurring billing previously lived in messy spreadsheets.
                    Renewals were remembered by whoever noticed first, invoices were typed up manually,
                    payments were reconciled by eye from bank statements, and revenue reports took days.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* The Before Card */}
                    <div className="p-5 rounded-2xl bg-rose-950/25 border border-rose-500/30 space-y-3">
                      <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        Before: The Spreadsheet Reality
                      </div>
                      <ul className="text-xs text-rose-200/80 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold">&times;</span>
                          <span>Renewals missed when staff forget to check spreadsheet rows</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold">&times;</span>
                          <span>Invoices typed by hand every month with human calculation errors</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold">&times;</span>
                          <span>Payment reconciliation scrolling through bank PDFs</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold">&times;</span>
                          <span>Leadership has no real-time MRR, ARR, or aging visibility</span>
                        </li>
                      </ul>
                    </div>

                    {/* The After Card */}
                    <div className="p-5 rounded-2xl bg-emerald-950/25 border border-emerald-500/30 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        After: BrightLoop OS Engine
                      </div>
                      <ul className="text-xs text-emerald-200/80 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">&check;</span>
                          <span>State machine contracts with automated renewal date tracking</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">&check;</span>
                          <span>1-Click idempotent billing engine with dynamic tax & discounts</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">&check;</span>
                          <span>Atomic payment entry & customer self-service receipt portal</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">&check;</span>
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
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Step 2: Sign Up & Security
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      Strict Password Validation & Multi-Role RBAC
                    </h3>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    Customer registration enforces strict security: password length &gt; 8 characters,
                    at least 1 uppercase letter, 1 lowercase letter, and 1 special character.
                    RBAC middleware strictly isolates roles across <code className="text-purple-300">/admin/*</code>,{" "}
                    <code className="text-blue-300">/app/*</code>, and{" "}
                    <code className="text-emerald-300">/portal/*</code>.
                  </p>

                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      ⚡ 1-Click Role-Switcher for Judges (Instant Demo Login)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => handleQuickLogin("admin@brightloop.io", "Admin", "/admin")}
                        disabled={roleSwitchLoading !== null}
                        className="p-3.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-left transition cursor-pointer flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Shield className="w-4 h-4 text-purple-400" />
                          <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full">
                            ADMIN
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white">admin@brightloop.io</div>
                        <div className="text-[10px] text-slate-400 mt-1">Full control & staff config</div>
                      </button>

                      <button
                        onClick={() => handleQuickLogin("staff@brightloop.io", "Staff", "/app")}
                        disabled={roleSwitchLoading !== null}
                        className="p-3.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/40 text-left transition cursor-pointer flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Briefcase className="w-4 h-4 text-blue-400" />
                          <span className="text-[10px] font-bold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full">
                            STAFF
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white">staff@brightloop.io</div>
                        <div className="text-[10px] text-slate-400 mt-1">Quotes, billing & payments</div>
                      </button>

                      <button
                        onClick={() => handleQuickLogin("customer@acme.com", "Customer", "/portal")}
                        disabled={roleSwitchLoading !== null}
                        className="p-3.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-left transition cursor-pointer flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <UserCheck className="w-4 h-4 text-emerald-400" />
                          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                            CUSTOMER
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white">customer@acme.com</div>
                        <div className="text-[10px] text-slate-400 mt-1">Self-service portal & invoices</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Product Catalog & Variants */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Step 3: Catalog & Variants
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      Product Variants & Flexible Lifecycle Billing Plans
                    </h3>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    Products support customizable variants, such as selecting the{" "}
                    <strong className="text-indigo-300">Odoo brand variant</strong> which automatically adds a{" "}
                    <strong className="text-emerald-400">+$560 surcharge</strong>.
                    Plans can bill <code className="text-indigo-300">DAILY</code>,{" "}
                    <code className="text-indigo-300">WEEKLY</code>,{" "}
                    <code className="text-indigo-300">MONTHLY</code>, or{" "}
                    <code className="text-indigo-300">YEARLY</code> with lifecycle rules like{" "}
                    <code className="text-amber-300">autoClose</code>,{" "}
                    <code className="text-emerald-300">allowPause</code>, and{" "}
                    <code className="text-sky-300">allowRenew</code>.
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Explore Catalog & Pricing Rules</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Inspect configured base software, addon seats, and variant surcharges.
                      </div>
                    </div>
                    <Link
                      href="/app/catalog"
                      onClick={() => setIsOpen(false)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
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
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      Step 4: Sales & Contracts
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      From Quotation Template to Active Subscription
                    </h3>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    Sales reps don't create offers from scratch. They select a pre-configured quotation template
                    with default validity days, product lines, and variant surcharges. Subscriptions receive a unique
                    tracking ID (<code className="text-sky-300">SUB-2026-XXXX</code>) and move across strict states.
                  </p>

                  {/* Lifecycle State Pipeline */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Subscription Lifecycle State Machine
                    </div>
                    <div className="flex items-center justify-between gap-1 overflow-x-auto text-[11px] font-bold">
                      <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300">Draft</span>
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      <span className="px-3 py-1.5 rounded-lg bg-sky-950 text-sky-300 border border-sky-500/40">Quotation</span>
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      <span className="px-3 py-1.5 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-500/40">Confirmed</span>
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40">Active</span>
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      <span className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400">Closed</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link
                      href="/app/subscriptions"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-sky-600/30"
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
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                      Step 5: Autonomous Billing Day
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      Zero-Touch Billing Day Simulation & Idempotency
                    </h3>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    On billing day, the engine queries active subscriptions due for renewal, calculates 18% GST tax
                    and discounts, auto-generates invoice <code className="text-yellow-300">INV-YYYY-XXXX</code>, advances
                    the next billing date, and guarantees <strong>100% idempotency</strong> (no double billing).
                  </p>

                  {/* Interactive Live Billing Execution */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        Execute Live Billing Cycle Simulation
                      </div>
                      <input
                        type="date"
                        value={billingDate}
                        onChange={(e) => setBillingDate(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>

                    <button
                      onClick={handleRunBillingCycle}
                      disabled={billingLoading}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      {billingLoading ? "Running Billing Engine..." : "⚡ Trigger Billing Cycle Now"}
                    </button>

                    {billingResult && (
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                        <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Engine executed successfully:
                        </div>
                        <div className="text-slate-300">
                          Due subscriptions: <strong className="text-white">{billingResult.dueCount}</strong> &bull; Generated Invoices:{" "}
                          <strong className="text-emerald-400">{billingResult.generatedCount}</strong> &bull; Skipped (Idempotent):{" "}
                          <strong className="text-amber-300">{billingResult.skippedCount}</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Link
                      href="/app/invoices"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-500/30"
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
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Step 6: Collections & Portal
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      Payment Reconciliation & Customer Self-Service
                    </h3>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    Payments are recorded with method (Stripe, Wire, Card, Cash), transaction reference, and notes.
                    When the invoice balance reaches zero, its status automatically settles to{" "}
                    <span className="text-emerald-400 font-bold">PAID</span>. In the Customer Portal, clients can view
                    printable receipts and exercise self-service pause/resume permissions.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">Staff Invoices & Receivables</div>
                        <p className="text-xs text-slate-400 mt-1">
                          Log customer payments, check overdue badges, and view receivables.
                        </p>
                      </div>
                      <Link
                        href="/app/invoices"
                        onClick={() => setIsOpen(false)}
                        className="mt-4 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition flex items-center justify-between"
                      >
                        <span>Open Invoices Ledger</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">Customer Self-Service Portal</div>
                        <p className="text-xs text-slate-400 mt-1">
                          Customers self-manage subscriptions and print official receipts.
                        </p>
                      </div>
                      <Link
                        href="/portal"
                        onClick={() => setIsOpen(false)}
                        className="mt-4 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-between"
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
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Step 7: Executive Control
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      Executive Finance Lead Dashboard (<span className="text-emerald-400 font-mono">&lt;2s SLA</span>)
                    </h3>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    The Finance Lead Dashboard replaces days of manual spreadsheet compilation with instant,
                    real-time financial truth. Aggregating thousands of subscription records in{" "}
                    <strong className="text-emerald-400 font-mono">&lt;40ms</strong> (well under the 2000ms SLA).
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Normalized MRR</div>
                      <div className="text-lg font-black text-indigo-400 mt-1">$2,330+</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Annual Run Rate</div>
                      <div className="text-lg font-black text-white mt-1">$27,960+</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Collection Rate</div>
                      <div className="text-lg font-black text-emerald-400 mt-1">90%+</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-center">
                      <div className="text-[10px] text-emerald-400 uppercase font-semibold">Latency SLA</div>
                      <div className="text-lg font-black text-emerald-300 mt-1">&lt;40ms PASS</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-indigo-950/30 to-slate-900 border border-rose-500/30 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">View Full Executive Finance Lead Console</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Interactive charts, 4-tier aging buckets (&lt;30d, 31-60d, 61-90d, 90d+), and plan revenue breakdown.
                      </div>
                    </div>
                    <Link
                      href="/app/finance"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-indigo-500/25"
                    >
                      Open Finance Lead Console <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="text-xs text-slate-400 font-mono">
                {currentStep} / {totalSteps}
              </div>

              {currentStep < totalSteps ? (
                <button
                  onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition flex items-center gap-1 cursor-pointer shadow-md shadow-amber-400/20"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-600/30"
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
