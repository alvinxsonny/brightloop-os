"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  UserCheck,
  TrendingUp,
  Receipt,
  Calendar,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Pause,
  Play,
  RefreshCw,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CustomerPortalPage() {
  const [user, setUser] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const [uRes, sRes, iRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/subscriptions"),
        fetch("/api/invoices"),
      ]);

      const uData = await uRes.json();
      setUser(uData.user);

      const sData = await sRes.json();
      setSubscriptions(sData.subscriptions || []);

      const iData = await iRes.json();
      setInvoices(iData.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelfServiceAction = async (subId: string, action: string) => {
    setActionLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/subscriptions/${subId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      setMessage(data.message || "Subscription updated successfully.");
      fetchCustomerData();
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const activeSubs = subscriptions.filter((s) => s.status === "ACTIVE");
  const unpaidInvoices = invoices.filter((inv) => inv.status !== "PAID" && inv.status !== "CANCELLED");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1">
        {/* Customer Welcome */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-2">
              <UserCheck className="w-3.5 h-3.5" />
              Customer Self-Service Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome, {user?.name || "Customer"}
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              {user?.company ? `${user.company} • ` : ""}Manage your recurring subscriptions, renew contracts, and inspect billing history without having to email anyone.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              {user?.email}
            </span>
          </div>
        </div>

        {/* Feedback alerts */}
        {message && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-semibold">Active Subscriptions</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">{activeSubs.length} Active</div>
            <div className="text-xs text-slate-500 mt-1">Directly self-managed</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-semibold">Total Invoices</span>
              <Receipt className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">{invoices.length} Invoices</div>
            <div className="text-xs text-slate-500 mt-1">Full statement history</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-semibold">Pending Balance</span>
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300">
              {formatCurrency(unpaidInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0))}
            </div>
            <div className="text-xs text-slate-500 mt-1">{unpaidInvoices.length} unpaid invoices</div>
          </div>
        </div>

        {/* Subscriptions Section with Self-Service Actions */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl mb-8">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">My Subscriptions & Self-Service Controls</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Subscription #</th>
                  <th className="px-6 py-3.5 font-medium">Plan</th>
                  <th className="px-6 py-3.5 font-medium">Status</th>
                  <th className="px-6 py-3.5 font-medium">Next Renewal</th>
                  <th className="px-6 py-3.5 font-medium">Amount</th>
                  <th className="px-6 py-3.5 font-medium text-right">Self-Service Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      You have no subscriptions on record.
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4 font-mono font-medium text-white">{sub.subscriptionNumber}</td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-200">{sub.plan?.name}</span>
                        <span className="block text-xs text-slate-500">
                          Billed {sub.plan?.frequency?.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            sub.status === "ACTIVE"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : sub.status === "PAUSED"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-slate-700/50 text-slate-300"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-xs">
                        {sub.status === "ACTIVE" ? formatDate(sub.nextBillingDate) : "—"}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">{formatCurrency(sub.totalAmount)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Pause Action */}
                          {sub.status === "ACTIVE" && sub.plan?.allowPause && (
                            <button
                              onClick={() => handleSelfServiceAction(sub.id, "PAUSE")}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium transition flex items-center gap-1"
                              title="Pause subscription"
                            >
                              <Pause className="w-3 h-3" />
                              Pause
                            </button>
                          )}

                          {/* Resume Action */}
                          {sub.status === "PAUSED" && (
                            <button
                              onClick={() => handleSelfServiceAction(sub.id, "RESUME")}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition flex items-center gap-1"
                              title="Resume subscription"
                            >
                              <Play className="w-3 h-3" />
                              Resume
                            </button>
                          )}

                          {/* Renew Action */}
                          {sub.plan?.allowRenew && sub.status !== "CLOSED" && (
                            <button
                              onClick={() => handleSelfServiceAction(sub.id, "RENEW")}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition flex items-center gap-1"
                              title="Renew plan"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Renew
                            </button>
                          )}

                          {/* Early Close Action */}
                          {sub.plan?.allowEarlyClose && sub.status !== "CLOSED" && (
                            <button
                              onClick={() => handleSelfServiceAction(sub.id, "CLOSE")}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium transition flex items-center gap-1"
                              title="Cancel subscription"
                            >
                              <XCircle className="w-3 h-3" />
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Invoices Section */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Billing History & Invoices</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Invoice #</th>
                  <th className="px-6 py-3.5 font-medium">Issue Date</th>
                  <th className="px-6 py-3.5 font-medium">Due Date</th>
                  <th className="px-6 py-3.5 font-medium">Status</th>
                  <th className="px-6 py-3.5 font-medium">Total</th>
                  <th className="px-6 py-3.5 font-medium">Balance Due</th>
                  <th className="px-6 py-3.5 font-medium text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4 font-mono font-medium text-white">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 text-slate-300 text-xs">{formatDate(inv.issueDate)}</td>
                      <td className="px-6 py-4 text-slate-300 text-xs">{formatDate(inv.dueDate)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            inv.status === "PAID"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : inv.status === "CONFIRMED"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : inv.isOverdue
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-slate-700/50 text-slate-300"
                          }`}
                        >
                          {inv.isOverdue ? "OVERDUE" : inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">{formatCurrency(inv.totalAmount)}</td>
                      <td className="px-6 py-4 font-medium">
                        {inv.balanceDue > 0 ? (
                          <span className={inv.isOverdue ? "text-rose-400 font-bold" : "text-amber-400"}>
                            {formatCurrency(inv.balanceDue)}
                          </span>
                        ) : (
                          <span className="text-emerald-400">Settled</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/app/invoices/${inv.id}`}
                          className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          View Receipt
                          <ArrowRight className="w-3.5 h-3.5" />
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
    </div>
  );
}
