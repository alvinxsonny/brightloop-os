"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { TrendingUp, Plus, Search, ArrowRight, FileText } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";

export default function SubscriptionsListPage() {
  const { formatCurrency } = useCurrency();
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

  return (
    <div className="min-h-screen text-slate-900 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 md:pl-28">
        <div className="p-6 rounded-3xl glass-panel mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Contract & Quote Lifecycle
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Subscriptions & Quotations
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage offers moving from Draft ➔ Quotation ➔ Confirmed ➔ Active ➔ Closed.
            </p>
          </div>

          <Link
            href="/app/subscriptions/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            New Quotation / Offer
          </Link>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 text-xs">
            {["ALL", "QUOTATION", "CONFIRMED", "ACTIVE", "PAUSED", "CLOSED", "DRAFT"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-medium transition whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? "bg-emerald-600 text-white font-bold shadow-xs"
                    : "glass-card text-slate-600 hover:text-slate-900 hover:bg-emerald-50/50"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscription or customer..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/90 border border-emerald-500/20 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>
        </div>

        <div className="mt-6 glass-panel rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 font-medium">
                <tr>
                  <th className="px-6 py-3.5">Subscription #</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Plan</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Next Billing</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                      Loading subscriptions...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                      No subscriptions found matching this filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 font-mono font-medium text-slate-900 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <Link
                          href={`/app/subscriptions/${sub.id}`}
                          className="hover:text-indigo-600 transition"
                        >
                          {sub.subscriptionNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{sub.customer?.name}</div>
                        <div className="text-xs text-slate-500">
                          {sub.customer?.company || sub.customer?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-800 font-medium">{sub.plan?.name}</div>
                        <div className="text-xs text-slate-500">
                          {sub.plan?.frequency?.toLowerCase()} • {sub.lines?.length || 0} lines
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {sub.status === "ACTIVE" ? formatDate(sub.nextBillingDate) : "—"}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatCurrency(sub.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/app/subscriptions/${sub.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-indigo-600 transition"
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
