"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  XCircle,
  RefreshCw,
  FileText,
  AlertCircle,
  Receipt,
  Calendar,
  Building,
  User,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function SubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchSubscription();
  }, [id]);

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const [uRes, sRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch(`/api/subscriptions/${id}`),
      ]);

      const uData = await uRes.json();
      setUser(uData.user);

      const sData = await sRes.json();
      if (!sRes.ok) throw new Error(sData.error || "Subscription not found");
      setSub(sData.subscription);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransition = async (action: string) => {
    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/subscriptions/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      setSuccess(data.message || "Status updated successfully.");
      setSub(data.subscription);
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar user={user} />
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Loading subscription details...
        </div>
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar user={user} />
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <p className="text-lg text-white mb-2">Subscription Not Found</p>
          <Link href="/app/subscriptions" className="text-xs text-indigo-400 hover:underline">
            Return to Subscriptions List
          </Link>
        </div>
      </div>
    );
  }

  // Stepper logic
  const stages = ["DRAFT", "QUOTATION", "CONFIRMED", "ACTIVE", "CLOSED"];
  const currentStageIndex = stages.indexOf(sub.status === "PAUSED" ? "ACTIVE" : sub.status);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-6xl mx-auto px-6 py-8 w-full flex-1">
        {/* Back navigation */}
        <Link
          href="/app/subscriptions"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Subscriptions
        </Link>

        {/* Top Header Card */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-xl sm:text-2xl font-bold text-white tracking-tight">
                {sub.subscriptionNumber}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                  sub.status === "ACTIVE"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : sub.status === "PAUSED"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    : sub.status === "QUOTATION"
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                    : sub.status === "CONFIRMED"
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                    : "bg-slate-700/50 text-slate-300 border-slate-600/30"
                }`}
              >
                {sub.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-400" />
                {sub.customer?.name} {sub.customer?.company ? `(${sub.customer.company})` : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Started {formatDate(sub.startDate)}
              </span>
              <span>•</span>
              <span className="text-white font-medium">
                Plan: {sub.plan?.name} ({sub.plan?.frequency})
              </span>
            </div>
          </div>

          {/* Action Transition Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {sub.status === "DRAFT" && (
              <button
                onClick={() => handleTransition("TO_QUOTATION")}
                disabled={updating}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                Send Quotation
              </button>
            )}

            {sub.status === "QUOTATION" && (
              <button
                onClick={() => handleTransition("CONFIRM")}
                disabled={updating}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confirm Offer
              </button>
            )}

            {sub.status === "CONFIRMED" && (
              <button
                onClick={() => handleTransition("ACTIVATE")}
                disabled={updating}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                Activate Subscription
              </button>
            )}

            {sub.status === "ACTIVE" && (
              <>
                {sub.plan?.allowPause && (
                  <button
                    onClick={() => handleTransition("PAUSE")}
                    disabled={updating}
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    Pause
                  </button>
                )}

                {sub.plan?.allowEarlyClose && (
                  <button
                    onClick={() => handleTransition("CLOSE")}
                    disabled={updating}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Close Early
                  </button>
                )}

                {sub.plan?.allowRenew && (
                  <button
                    onClick={() => handleTransition("RENEW")}
                    disabled={updating}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium text-xs transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Renew
                  </button>
                )}
              </>
            )}

            {sub.status === "PAUSED" && (
              <button
                onClick={() => handleTransition("RESUME")}
                disabled={updating}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                Resume Subscription
              </button>
            )}
          </div>
        </div>

        {/* Feedback alerts */}
        {success && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stepper Progress Bar */}
        <div className="mt-6 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] font-semibold uppercase text-slate-400 mb-3 tracking-wider">
            Lifecycle Progress:
          </div>
          <div className="grid grid-cols-5 gap-2">
            {stages.map((st, i) => {
              const isPast = i < currentStageIndex;
              const isCurrent = i === currentStageIndex;
              return (
                <div key={st} className="flex flex-col items-center text-center">
                  <div
                    className={`w-full h-1.5 rounded-full mb-2 ${
                      isPast || isCurrent ? "bg-indigo-500" : "bg-slate-800"
                    }`}
                  />
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? "text-indigo-400"
                        : isPast
                        ? "text-slate-300"
                        : "text-slate-600"
                    }`}
                  >
                    {st}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contract Info Tiles */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-500 block uppercase font-semibold">Payment Terms</span>
            <span className="text-white font-medium text-sm mt-0.5 block">{sub.paymentTerms}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-500 block uppercase font-semibold">Next Billing Run</span>
            <span className="text-white font-medium text-sm mt-0.5 block">
              {sub.status === "ACTIVE" ? formatDate(sub.nextBillingDate) : "—"}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-500 block uppercase font-semibold">Contract Expiry</span>
            <span className="text-white font-medium text-sm mt-0.5 block">
              {sub.expiryDate ? formatDate(sub.expiryDate) : "Auto-Renewing"}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-500 block uppercase font-semibold">Total Value</span>
            <span className="text-emerald-400 font-bold text-sm mt-0.5 block">
              {formatCurrency(sub.totalAmount)}
            </span>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mt-6 bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Itemized Products & Add-ons</h2>
            <span className="text-xs text-slate-400">{sub.lines?.length || 0} line items</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/50 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">Variant Surcharge</th>
                  <th className="px-6 py-3 font-medium text-center">Quantity</th>
                  <th className="px-6 py-3 font-medium">Unit Price</th>
                  <th className="px-6 py-3 font-medium">Tax</th>
                  <th className="px-6 py-3 font-medium text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sub.lines?.map((line: any) => (
                  <tr key={line.id} className="hover:bg-slate-800/20">
                    <td className="px-6 py-4 font-medium text-white">
                      {line.product?.name}
                      {line.variant && (
                        <span className="block text-[11px] text-indigo-400 font-normal mt-0.5">
                          Variant: {line.variant.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {line.variantSurcharge > 0 ? (
                        <span className="text-indigo-300 font-medium">
                          +{formatCurrency(line.variantSurcharge)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-white">
                      {line.quantity}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {formatCurrency(line.unitPrice)}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {line.taxAmount > 0 ? formatCurrency(line.taxAmount) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-white">
                      {formatCurrency(line.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Summary */}
          <div className="p-6 border-t border-slate-800 flex justify-end bg-slate-900/50">
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-medium text-white">{formatCurrency(sub.subtotal)}</span>
              </div>
              {sub.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount:</span>
                  <span>-{formatCurrency(sub.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Taxes:</span>
                <span className="font-medium text-white">+{formatCurrency(sub.taxAmount)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-base font-bold text-white">
                <span>Total Amount:</span>
                <span className="text-emerald-400">{formatCurrency(sub.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connected Invoices */}
        <div className="mt-6 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Connected Billing Invoices</h2>
          </div>

          {sub.invoices && sub.invoices.length > 0 ? (
            <div className="space-y-2">
              {sub.invoices.map((inv: any) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium text-white">{inv.invoiceNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        inv.status === "PAID"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-white">{formatCurrency(inv.totalAmount)}</span>
                    <Link
                      href={`/app/invoices/${inv.id}`}
                      className="text-indigo-400 hover:underline text-xs"
                    >
                      View Invoice
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              No invoices generated yet for this subscription. Invoices are produced automatically on billing day.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
