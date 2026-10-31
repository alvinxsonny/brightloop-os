"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  Receipt,
  Play,
  Search,
  Filter,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Calendar,
  X,
  CreditCard,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function InvoicesListPage() {
  const [user, setUser] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Billing Run Modal / Simulation
  const [runningBilling, setRunningBilling] = useState(false);
  const [billingResult, setBillingResult] = useState<any | null>(null);
  const [forceRun, setForceRun] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const uRes = await fetch("/api/auth/me");
      const uData = await uRes.json();
      setUser(uData.user);

      const url = statusFilter === "ALL"
        ? "/api/invoices"
        : `/api/invoices?status=${statusFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunBilling = async () => {
    setRunningBilling(true);
    try {
      const res = await fetch("/api/billing/run-cycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceAllActive: forceRun }),
      });

      const data = await res.json();
      setBillingResult(data);
      fetchInvoices();
    } catch (err: any) {
      console.error(err);
    } finally {
      setRunningBilling(false);
    }
  };

  const filtered = invoices.filter((inv) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(term) ||
      inv.customer?.name?.toLowerCase().includes(term) ||
      inv.customer?.company?.toLowerCase().includes(term) ||
      inv.subscription?.subscriptionNumber?.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: string, isOverdue: boolean) => {
    if (isOverdue) {
      return "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse";
    }
    switch (status) {
      case "PAID":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "CONFIRMED":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "DRAFT":
        return "bg-slate-700/50 text-slate-300 border-slate-600/30";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-800 text-slate-300";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 mb-2">
              <Receipt className="w-3.5 h-3.5" />
              Automated Recurring Invoicing
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Billing & Invoices
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Zero manual typing. Generated directly from active subscriptions with automated taxes and discounts.
            </p>
          </div>

          {/* Trigger Billing Run Button for Hackathon Judges */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRunBilling}
              disabled={runningBilling}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 transition disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              {runningBilling ? "Executing Billing Run..." : "Trigger Billing Day Run"}
            </button>
          </div>
        </div>

        {/* Filter bar & Search */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 text-xs">
            {["ALL", "DRAFT", "CONFIRMED", "PAID", "OVERDUE", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice or customer..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Invoices Table */}
        <div className="mt-6 bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Invoice #</th>
                  <th className="px-6 py-3.5 font-medium">Customer</th>
                  <th className="px-6 py-3.5 font-medium">Subscription</th>
                  <th className="px-6 py-3.5 font-medium">Issue Date</th>
                  <th className="px-6 py-3.5 font-medium">Due Date</th>
                  <th className="px-6 py-3.5 font-medium">Status</th>
                  <th className="px-6 py-3.5 font-medium">Total</th>
                  <th className="px-6 py-3.5 font-medium">Balance Due</th>
                  <th className="px-6 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-slate-500">
                      Loading invoices...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-slate-500">
                      No invoices found for this filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4 font-mono font-medium text-white flex items-center gap-2">
                        <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                        <Link href={`/app/invoices/${inv.id}`} className="hover:text-emerald-400 transition">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{inv.customer?.name}</div>
                        <div className="text-xs text-slate-400">
                          {inv.customer?.company || inv.customer?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-300">
                        {inv.subscription?.subscriptionNumber || "One-time"}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">{formatDate(inv.issueDate)}</td>
                      <td className="px-6 py-4 text-xs text-slate-400">{formatDate(inv.dueDate)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                            inv.status,
                            inv.isOverdue
                          )}`}
                        >
                          {inv.isOverdue ? "OVERDUE" : inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">{formatCurrency(inv.totalAmount)}</td>
                      <td className="px-6 py-4 font-semibold">
                        {inv.balanceDue > 0 ? (
                          <span className={inv.isOverdue ? "text-rose-400" : "text-amber-400"}>
                            {formatCurrency(inv.balanceDue)}
                          </span>
                        ) : (
                          <span className="text-emerald-400">Paid in full</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/app/invoices/${inv.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-indigo-300 transition"
                        >
                          View
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* BILLING RUN MODAL / NOTIFICATION */}
      {billingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setBillingResult(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Billing Run Completed</h3>
                <p className="text-xs text-slate-400">{billingResult.message}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                <div className="text-2xl font-bold text-emerald-400">{billingResult.generatedCount}</div>
                <div className="text-xs text-slate-400">Invoices Generated</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                <div className="text-2xl font-bold text-slate-300">{billingResult.skippedCount}</div>
                <div className="text-xs text-slate-400">Skipped (Idempotent / Closed)</div>
              </div>
            </div>

            {billingResult.invoices?.length > 0 && (
              <div className="mb-4 max-h-48 overflow-y-auto space-y-1.5 pr-1">
                <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Generated Records:</div>
                {billingResult.invoices.map((inv: any) => (
                  <div
                    key={inv.id}
                    className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono text-white font-medium">{inv.invoiceNumber}</span>
                      <span className="text-slate-400 ml-2">({inv.customerName})</span>
                    </div>
                    <span className="font-bold text-emerald-400">{formatCurrency(inv.totalAmount)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setBillingResult(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
              >
                Close & Review Invoices
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
