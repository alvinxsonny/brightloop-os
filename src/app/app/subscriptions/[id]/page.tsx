"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Play,
  Pause,
  XCircle,
  RefreshCw,
  FileText,
  AlertCircle,
  Receipt,
  Calendar,
  Building,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

export default function SubscriptionDetailPage() {
  const { toast } = useToast();
  const params = useParams();
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

      toast.success(
        data.message || `Subscription transitioned to ${data.subscription?.status || action}!`,
        "Lifecycle State Machine"
      );
      setSuccess(data.message || "Status updated successfully.");
      setSub(data.subscription);
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      toast.error(err.message, "State Transition Failed");
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar user={user} />
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
          Loading subscription details...
        </div>
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar user={user} />
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
          <p className="text-lg text-slate-900 font-semibold mb-2">Subscription Not Found</p>
          <Link href="/app/subscriptions" className="text-xs text-indigo-600 hover:underline">
            Return to Subscriptions List
          </Link>
        </div>
      </div>
    );
  }

  const stages = ["DRAFT", "QUOTATION", "CONFIRMED", "ACTIVE", "CLOSED"];
  const currentStageIndex = stages.indexOf(sub.status === "PAUSED" ? "ACTIVE" : sub.status);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-6xl mx-auto px-6 py-8 w-full flex-1">
        <Link
          href="/app/subscriptions"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Subscriptions
        </Link>

        {/* Top Header Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {sub.subscriptionNumber}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${
                  sub.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : sub.status === "PAUSED"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : sub.status === "QUOTATION"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : sub.status === "CONFIRMED"
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {sub.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-600" />
                {sub.customer?.name} {sub.customer?.company ? `(${sub.customer.company})` : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Started {formatDate(sub.startDate)}
              </span>
              <span>•</span>
              <span className="text-slate-800 font-medium">
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
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                Send Quotation
              </button>
            )}

            {sub.status === "QUOTATION" && (
              <button
                onClick={() => handleTransition("CONFIRM")}
                disabled={updating}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confirm Offer
              </button>
            )}

            {sub.status === "CONFIRMED" && (
              <button
                onClick={() => handleTransition("ACTIVATE")}
                disabled={updating}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
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
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    Pause
                  </button>
                )}

                {sub.plan?.allowEarlyClose && (
                  <button
                    onClick={() => handleTransition("CLOSE")}
                    disabled={updating}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Close Early
                  </button>
                )}

                {sub.plan?.allowRenew && (
                  <button
                    onClick={() => handleTransition("RENEW")}
                    disabled={updating}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-medium text-xs transition disabled:opacity-50 flex items-center gap-1.5"
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
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                Resume Subscription
              </button>
            )}
          </div>
        </div>

        {/* Feedback alerts */}
        {success && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Stepper Progress Bar */}
        <div className="mt-6 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold uppercase text-slate-500 mb-3 tracking-wider">
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
                      isPast || isCurrent ? "bg-indigo-600" : "bg-slate-100"
                    }`}
                  />
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? "text-indigo-600"
                        : isPast
                        ? "text-slate-700"
                        : "text-slate-400"
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
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-xs">
            <span className="text-slate-500 block uppercase font-medium">Payment Terms</span>
            <span className="text-slate-900 font-semibold text-sm mt-0.5 block">{sub.paymentTerms}</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-xs">
            <span className="text-slate-500 block uppercase font-medium">Next Billing Run</span>
            <span className="text-slate-900 font-semibold text-sm mt-0.5 block">
              {sub.status === "ACTIVE" ? formatDate(sub.nextBillingDate) : "—"}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-xs">
            <span className="text-slate-500 block uppercase font-medium">Contract Expiry</span>
            <span className="text-slate-900 font-semibold text-sm mt-0.5 block">
              {sub.expiryDate ? formatDate(sub.expiryDate) : "Auto-Renewing"}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-xs">
            <span className="text-slate-500 block uppercase font-medium">Total Value</span>
            <span className="text-emerald-600 font-bold text-sm mt-0.5 block">
              {formatCurrency(sub.totalAmount)}
            </span>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Itemized Products & Add-ons</h2>
            <span className="text-xs text-slate-500">{sub.lines?.length || 0} line items</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">Product</th>
                  <th className="px-6 py-3 font-semibold">Variant Surcharge</th>
                  <th className="px-6 py-3 font-semibold text-center">Quantity</th>
                  <th className="px-6 py-3 font-semibold">Unit Price</th>
                  <th className="px-6 py-3 font-semibold">Tax</th>
                  <th className="px-6 py-3 font-semibold text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sub.lines?.map((line: any) => (
                  <tr key={line.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {line.product?.name}
                      {line.variant && (
                        <span className="block text-[11px] text-indigo-600 font-normal mt-0.5">
                          Variant: {line.variant.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {line.variantSurcharge > 0 ? (
                        <span className="text-indigo-600 font-medium">
                          +{formatCurrency(line.variantSurcharge)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-900">
                      {line.quantity}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatCurrency(line.unitPrice)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {line.taxAmount > 0 ? formatCurrency(line.taxAmount) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      {formatCurrency(line.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Summary */}
          <div className="p-6 border-t border-slate-200 flex justify-end bg-slate-50/50">
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-medium text-slate-900">{formatCurrency(sub.subtotal)}</span>
              </div>
              {sub.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount:</span>
                  <span>-{formatCurrency(sub.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Taxes:</span>
                <span className="font-medium text-slate-900">+{formatCurrency(sub.taxAmount)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
                <span>Total Amount:</span>
                <span className="text-emerald-600">{formatCurrency(sub.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connected Invoices */}
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-slate-900">Connected Billing Invoices</h2>
          </div>

          {sub.invoices && sub.invoices.length > 0 ? (
            <div className="space-y-2">
              {sub.invoices.map((inv: any) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium text-slate-900">{inv.invoiceNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        inv.status === "PAID"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-900">{formatCurrency(inv.totalAmount)}</span>
                    <Link
                      href={`/app/invoices/${inv.id}`}
                      className="text-indigo-600 hover:underline text-xs font-medium"
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
