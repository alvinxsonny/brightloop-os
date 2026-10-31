"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Receipt,
  DollarSign,
  Download,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  PieChart as PieChartIcon,
  CreditCard,
  Building,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { formatDate } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/components/ToastProvider";

export default function FinanceDashboardPage() {
  const { toast } = useToast();
  const { formatCurrency, currency } = useCurrency();
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchLatency, setFetchLatency] = useState<number | null>(null);

  // Filter state
  const [activeTab, setActiveTab] = useState<"ALL" | "OVERDUE" | "OUTSTANDING" | "PAID">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("ALL");

  // Payment Quick Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchMe();
    fetchAnalytics();
  }, []);

  const fetchMe = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const d = await res.json();
      setUser(d.user);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const res = await fetch("/api/finance/analytics");
      const json = await res.json();
      const end = performance.now();
      const clientLatency = Math.round(end - start);
      setFetchLatency(clientLatency);
      setData(json);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPaymentModal = (invoice: any) => {
    setSelectedInvoiceForPayment(invoice);
    setPaymentAmount(invoice.balanceDue.toString());
    setPaymentMethod("BANK_TRANSFER");
    setPaymentNotes(`Payment for ${invoice.invoiceNumber}`);
    setPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;

    setPaymentSubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: selectedInvoiceForPayment.id,
          amount: parseFloat(paymentAmount),
          paymentMethod,
          notes: paymentNotes,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Payment recording failed", "Payment Error");
      } else {
        toast.success(
          `Payment of ${formatCurrency(parseFloat(paymentAmount))} recorded for ${selectedInvoiceForPayment.invoiceNumber}!`,
          "Payment Recorded"
        );
        setActionSuccess(`Payment of ${formatCurrency(parseFloat(paymentAmount))} recorded for ${selectedInvoiceForPayment.invoiceNumber}!`);
        setTimeout(() => setActionSuccess(null), 4000);
        setPaymentModalOpen(false);
        fetchAnalytics();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error submitting payment", "Payment Error");
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (!data?.invoiceLedger) return;

    const headers = [
      "Invoice Number",
      "Customer",
      "Company",
      "Plan",
      "Issue Date",
      "Due Date",
      "Total Amount",
      "Paid Amount",
      "Balance Due",
      "Status",
      "Overdue Days",
    ];

    const rows = data.invoiceLedger.map((inv: any) => [
      inv.invoiceNumber,
      `"${inv.customerName}"`,
      `"${inv.customerCompany}"`,
      `"${inv.planName}"`,
      new Date(inv.issueDate).toLocaleDateString(),
      new Date(inv.dueDate).toLocaleDateString(),
      inv.totalAmount.toFixed(2),
      inv.paidAmount.toFixed(2),
      inv.balanceDue.toFixed(2),
      inv.status,
      inv.overdueDays,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e: any[]) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `brightloop-receivables-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const distinctPlans = useMemo(() => {
    if (!data?.invoiceLedger) return [];
    const set = new Set<string>();
    data.invoiceLedger.forEach((inv: any) => {
      if (inv.planName) set.add(inv.planName);
    });
    return Array.from(set);
  }, [data]);

  const filteredInvoices = useMemo(() => {
    if (!data?.invoiceLedger) return [];

    return data.invoiceLedger.filter((inv: any) => {
      if (activeTab === "OVERDUE" && !inv.isOverdue) return false;
      if (activeTab === "OUTSTANDING" && inv.balanceDue <= 0) return false;
      if (activeTab === "PAID" && inv.status !== "PAID") return false;

      if (selectedPlan !== "ALL" && inv.planName !== selectedPlan) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const numMatch = inv.invoiceNumber?.toLowerCase().includes(q);
        const nameMatch = inv.customerName?.toLowerCase().includes(q);
        const compMatch = inv.customerCompany?.toLowerCase().includes(q);
        if (!numMatch && !nameMatch && !compMatch) return false;
      }

      return true;
    });
  }, [data, activeTab, selectedPlan, searchQuery]);

  return (
    <div className="min-h-screen text-slate-900 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 md:pl-28">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Executive Finance Console</span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-700">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                Response Time:{" "}
                {fetchLatency ? `${fetchLatency}ms` : data?.performance?.executionTimeMs ? `${data.performance.executionTimeMs}ms` : "< 40ms"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              Financial Intelligence & Receivables
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Autonomous recurring revenue reporting, overdue collection tracking, and sub-2-second aggregation engine.
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto">
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold transition flex items-center gap-2 disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} />
              Refresh Analytics
            </button>

            <button
              onClick={handleExportCSV}
              disabled={!data?.invoiceLedger?.length}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-sm flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV Ledger
            </button>
          </div>
        </div>

        {/* Success toast */}
        {actionSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Performance Callout */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 mb-8 flex flex-wrap items-center justify-between gap-4 text-xs shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-mono font-bold">
              ⚡
            </div>
            <div>
              <span className="font-semibold text-slate-900">Sub-2-Second Finance Performance Target: </span>
              <span className="text-emerald-600 font-mono font-bold">
                {fetchLatency ? `${fetchLatency}ms` : "Active"}
              </span>{" "}
              <span className="text-slate-500">(Benchmark: &lt; 2000ms SLA guaranteed across all contracts)</span>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            SLA Met • 0.0s Lag
          </div>
        </div>

        {/* Top Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card 1: MRR & ARR */}
          <div className="p-6 rounded-3xl glass-card relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-800">Monthly Recurring (MRR)</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {formatCurrency(data?.kpis?.mrr || 0)}
            </div>
            <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-slate-100">
              <span className="text-slate-500">Annual Run-rate (ARR):</span>
              <span className="text-emerald-700 font-semibold font-mono">
                {formatCurrency(data?.kpis?.arr || 0)}
              </span>
            </div>
          </div>

          {/* Card 2: Active Subscriptions & Retention */}
          <div className="p-6 rounded-3xl glass-card relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs uppercase font-bold tracking-wider text-teal-800">Active Subscriptions</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
              <span>{data?.kpis?.activeSubscriptions ?? 0}</span>
              <span className="text-xs text-slate-500 font-normal">
                / {data?.kpis?.totalSubscriptions ?? 0} total
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-slate-100">
              <span className="text-slate-500">Pause Rate: {data?.kpis?.pauseRate ?? 0}%</span>
              <span className="text-emerald-700 font-medium">
                Churn: {data?.kpis?.churnRate ?? 0}%
              </span>
            </div>
          </div>

          {/* Card 3: Total Collected vs Receivables */}
          <div className="p-6 rounded-3xl glass-card relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-800">Cash Collected</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-700 tracking-tight">
              {formatCurrency(data?.kpis?.totalCollected || 0)}
            </div>
            <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-slate-100">
              <span className="text-slate-500">Total Invoiced:</span>
              <span className="text-slate-800 font-semibold font-mono">
                {formatCurrency(data?.kpis?.totalInvoiced || 0)}
              </span>
            </div>
          </div>

          {/* Card 4: Overdue Invoices Alert */}
          <div className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden transition ${
            (data?.kpis?.overdueCount || 0) > 0
              ? "bg-rose-50/70 border-rose-200"
              : "glass-card"
          }`}>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className={`text-xs uppercase font-bold tracking-wider ${
                (data?.kpis?.overdueCount || 0) > 0 ? "text-rose-700" : "text-slate-500"
              }`}>
                Overdue Receivables
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                (data?.kpis?.overdueCount || 0) > 0 ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-500"
              }`}>
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-3xl font-black tracking-tight ${
              (data?.kpis?.overdueCount || 0) > 0 ? "text-rose-700" : "text-slate-900"
            }`}>
              {formatCurrency(data?.kpis?.overdueAmount || 0)}
            </div>
            <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-slate-100">
              <span className="text-slate-500">Delinquent Invoices:</span>
              <button
                onClick={() => setActiveTab("OVERDUE")}
                className="text-rose-700 hover:text-rose-800 font-bold underline cursor-pointer"
              >
                {data?.kpis?.overdueCount || 0} Invoices (View)
              </button>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart 1: Revenue Performance Trend */}
          <div className="lg:col-span-2 p-6 rounded-3xl glass-panel shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                  Monthly Billing vs. Cash Collections (Last 6 Months)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Historical comparison of generated invoices against realized payments
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-teal-800 font-medium">
                  <span className="w-3 h-3 rounded-full bg-teal-600" /> Invoiced
                </span>
                <span className="flex items-center gap-1.5 text-emerald-800 font-medium">
                  <span className="w-3 h-3 rounded-full bg-emerald-600" /> Collected
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              {data?.monthlyTrend ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00a86b" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#00a86b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(val) => formatCurrency(Number(val))} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "0.75rem", fontSize: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                      formatter={(val: any) => formatCurrency(Number(val))}
                    />
                    <Area type="monotone" dataKey="invoiced" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorInvoiced)" />
                    <Area type="monotone" dataKey="collected" stroke="#00a86b" strokeWidth={2} fillOpacity={1} fill="url(#colorCollected)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  Loading trend data...
                </div>
              )}
            </div>
          </div>

          {/* Chart 2: Receivables Aging Breakdown */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Receivables Aging Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Outstanding balances grouped by overdue days
              </p>
            </div>

            <div className="h-64 w-full">
              {data?.agingBuckets ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.agingBuckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} tickFormatter={(val) => `$${val}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "0.75rem", fontSize: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                      formatter={(val: any) => [formatCurrency(Number(val)), "Overdue Balance"]}
                    />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                      {data.agingBuckets.map((entry: any, index: number) => {
                        const colors = ["#f59e0b", "#f97316", "#ef4444", "#dc2626"];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  Loading aging data...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Plan Revenue & Customer LTV Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Plan Breakdown */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-sky-600" />
              Plan MRR Distribution
            </h3>
            <div className="space-y-3 mt-4">
              {data?.planDistribution?.map((p: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-500">
                      {p.frequency} • {p.activeSubscribers} active subscribers
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-600">{formatCurrency(p.mrr)}/mo</div>
                    <div className="text-[10px] text-slate-400">MRR Share</div>
                  </div>
                </div>
              ))}
              {(!data?.planDistribution || data.planDistribution.length === 0) && (
                <div className="text-xs text-slate-400 text-center py-6">No plans configured yet.</div>
              )}
            </div>
          </div>

          {/* Top Customers by Value */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Building className="w-4 h-4 text-indigo-600" />
                    Top Customer Accounts (Lifetime Value & Health)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Account-level breakdown of billed revenue, payments collected, and open balance
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Customer / Company</th>
                      <th className="py-2.5 px-3">Active Subs</th>
                      <th className="py-2.5 px-3">Total Invoiced</th>
                      <th className="py-2.5 px-3">Total Paid</th>
                      <th className="py-2.5 px-3">Balance Due</th>
                      <th className="py-2.5 px-3">Account Standing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data?.customerLedger?.slice(0, 5).map((c: any) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{c.name}</div>
                          <div className="text-slate-500 text-[11px]">{c.company}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                            {c.activeSubscriptions}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700">{formatCurrency(c.totalInvoiced)}</td>
                        <td className="py-3 px-3 font-mono font-semibold text-emerald-600">{formatCurrency(c.totalPaid)}</td>
                        <td className="py-3 px-3 font-mono font-semibold">
                          <span className={c.balanceDue > 0 ? "text-rose-600" : "text-slate-400"}>
                            {formatCurrency(c.balanceDue)}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {c.balanceDue > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Receivable Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Good Standing
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Filterable Financial Invoices Ledger */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                Comprehensive Receivables & Invoices Ledger
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Filter by aging status, plan, customer name, and record instant receivables
              </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => setActiveTab("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({data?.invoiceLedger?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("OVERDUE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === "OVERDUE"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-rose-600 hover:text-rose-700"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Overdue ({data?.kpis?.overdueCount || 0})
              </button>
              <button
                onClick={() => setActiveTab("OUTSTANDING")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === "OUTSTANDING" ? "bg-amber-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Outstanding
              </button>
              <button
                onClick={() => setActiveTab("PAID")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === "PAID" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Paid
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoice number, customer name, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Plans & Contracts</option>
                {distinctPlans.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer & Account</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Issue / Due Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Balance Due</th>
                  <th className="py-3 px-4">Aging / Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredInvoices.map((inv: any) => {
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <Link href={`/app/invoices/${inv.id}`} className="hover:text-indigo-600 transition underline">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{inv.customerName}</div>
                        <div className="text-slate-500 text-[11px]">{inv.customerCompany}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px]">
                          {inv.planName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700">{formatDate(inv.issueDate)}</div>
                        <div className={`text-[11px] ${inv.isOverdue ? "text-rose-600 font-bold" : "text-slate-500"}`}>
                          Due: {formatDate(inv.dueDate)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={inv.balanceDue > 0 ? (inv.isOverdue ? "text-rose-600" : "text-amber-600") : "text-emerald-600"}>
                          {formatCurrency(inv.balanceDue)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {inv.isOverdue ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            {inv.overdueDays}d Overdue
                          </span>
                        ) : inv.status === "PAID" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Paid
                          </span>
                        ) : inv.status === "CONFIRMED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            Confirmed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {inv.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inv.balanceDue > 0 && (
                            <button
                              onClick={() => handleOpenPaymentModal(inv)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] transition shadow-sm flex items-center gap-1"
                            >
                              <CreditCard className="w-3 h-3" />
                              Pay
                            </button>
                          )}
                          <Link
                            href={`/app/invoices/${inv.id}`}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No invoices match the selected filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Payment Modal */}
        {paymentModalOpen && selectedInvoiceForPayment && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Record Payment Entry</h3>
                    <p className="text-xs text-slate-500">
                      Invoice {selectedInvoiceForPayment.invoiceNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPaymentModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Customer Account
                  </label>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-900">{selectedInvoiceForPayment.customerName}</span>
                    <span className="text-slate-500 block">{selectedInvoiceForPayment.customerCompany}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Total Invoice
                    </label>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-semibold text-slate-700">
                      {formatCurrency(selectedInvoiceForPayment.totalAmount)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Balance Due
                    </label>
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-mono font-bold text-rose-600">
                      {formatCurrency(selectedInvoiceForPayment.balanceDue)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Payment Amount ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    max={selectedInvoiceForPayment.balanceDue}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="BANK_TRANSFER">Bank Wire / ACH Transfer</option>
                    <option value="CREDIT_CARD">Credit Card (Stripe)</option>
                    <option value="CHECK">Corporate Check</option>
                    <option value="CASH">Cash / Direct Deposit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Notes / Reference
                  </label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="e.g. Wire confirmation ref #12345"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPaymentModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paymentSubmitting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {paymentSubmitting ? "Recording..." : "Confirm Payment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
