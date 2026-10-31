"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { TrendingUp, Plus, Search, Filter, ArrowRight, Eye, Calendar, FileText } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function SubscriptionsListPage() {
  const [user, setUser] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const uRes = await fetch("/api/auth/me");
      const uData = await uRes.json();
      setUser(uData.user);

      const url = statusFilter === "ALL"
        ? "/api/subscriptions"
        : `/api/subscriptions?status=${statusFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      setSubscriptions(data.subscriptions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = subscriptions.filter((sub) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      sub.subscriptionNumber.toLowerCase().includes(term) ||
      sub.customer?.name?.toLowerCase().includes(term) ||
      sub.customer?.company?.toLowerCase().includes(term) ||
      sub.plan?.name?.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "QUOTATION":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "CONFIRMED":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
      case "PAUSED":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "CLOSED":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      default:
        return "bg-slate-700/50 text-slate-300 border-slate-600/30";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20 mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Contract & Quote Lifecycle
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Subscriptions & Quotations
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage offers moving from Draft ➔ Quotation ➔ Confirmed ➔ Active ➔ Closed.
            </p>
          </div>

          <Link
            href="/app/subscriptions/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/25 transition"
          >
            <Plus className="w-4 h-4" />
            New Quotation / Offer
          </Link>
        </div>

        {/* Filter bar & Search */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 text-xs">
            {["ALL", "QUOTATION", "CONFIRMED", "ACTIVE", "PAUSED", "CLOSED", "DRAFT"].map((st) => (
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

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscription or customer..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Subscription #</th>
                  <th className="px-6 py-3.5 font-medium">Customer</th>
                  <th className="px-6 py-3.5 font-medium">Plan</th>
                  <th className="px-6 py-3.5 font-medium">Status</th>
                  <th className="px-6 py-3.5 font-medium">Next Billing</th>
                  <th className="px-6 py-3.5 font-medium">Amount</th>
                  <th className="px-6 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                      Loading subscriptions...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                      No subscriptions found matching this filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4 font-mono font-medium text-white flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        <Link
                          href={`/app/subscriptions/${sub.id}`}
                          className="hover:text-indigo-400 transition"
                        >
                          {sub.subscriptionNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{sub.customer?.name}</div>
                        <div className="text-xs text-slate-400">
                          {sub.customer?.company || sub.customer?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-200 font-medium">{sub.plan?.name}</div>
                        <div className="text-xs text-slate-500">
                          {sub.plan?.frequency?.toLowerCase()} • {sub.lines?.length || 0} lines
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                            sub.status
                          )}`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-300">
                        {sub.status === "ACTIVE" ? formatDate(sub.nextBillingDate) : "—"}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        {formatCurrency(sub.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/app/subscriptions/${sub.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-indigo-300 transition"
                        >
                          Inspect
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
    </div>
  );
}

