"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  XCircle,
  CreditCard,
  Receipt,
  AlertCircle,
  DollarSign,
  Building,
  Calendar,
  Clock,
  ShieldCheck,
  X,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

export default function InvoiceDetailPage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Payment Recording Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [transactionRef, setTransactionRef] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [recordingPayment, setRecordingPayment] = useState(false);

  useEffect(() => {
    if (id) fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const [uRes, invRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch(`/api/invoices/${id}`),
      ]);

      const uData = await uRes.json();
      setUser(uData.user);

      const invData = await invRes.json();
      if (!invRes.ok) throw new Error(invData.error || "Invoice not found");
      setInvoice(invData.invoice);
      setPaymentAmount(invData.invoice.balanceDue.toString());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (action: "CONFIRM" | "CANCEL") => {
    setUpdating(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/invoices/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      toast.success(data.message || `Invoice ${action.toLowerCase()}ed successfully.`, "Invoice Status");
      setMessage(data.message);
      setInvoice(data.invoice);
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      toast.error(err.message, "Status Update Failed");
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecordingPayment(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: id,
          amount: paymentAmount,
          paymentMethod,
          paymentDate,
          transactionReference: transactionRef,
          notes: paymentNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record payment");

      toast.success(
        `Payment of ${formatCurrency(parseFloat(paymentAmount) || 0)} recorded successfully!`,
        "Payment Received"
      );
      setMessage(data.message);
      setShowPaymentModal(false);
      fetchInvoice();
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      toast.error(err.message, "Payment Error");
      setError(err.message);
    } finally {
      setRecordingPayment(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar user={user} />
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Loading invoice details...
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar user={user} />
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <p className="text-lg text-white mb-2">Invoice Not Found</p>
          <Link href="/app/invoices" className="text-xs text-indigo-400 hover:underline">
            Return to Invoices List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hide navbar on print */}
      <div className="print:hidden">
        <Navbar user={user} />
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8 w-full flex-1">
        {/* Navigation & Action Bar (Hidden during print) */}
        <div className="print:hidden mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/app/invoices"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Invoices
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition border border-slate-700 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>

            {/* Record Payment Button */}
            {invoice.balanceDue > 0 && invoice.status !== "CANCELLED" && (
              <button
                onClick={() => {
                  setPaymentAmount(invoice.balanceDue.toString());
                  setShowPaymentModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5" />
                Record Payment
              </button>
            )}

            {invoice.status === "DRAFT" && (
              <button
                onClick={() => handleUpdateStatus("CONFIRM")}
                disabled={updating}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shadow flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confirm Invoice
              </button>
            )}

            {invoice.status !== "CANCELLED" && invoice.status !== "PAID" && (
              <button
                onClick={() => handleUpdateStatus("CANCEL")}
                disabled={updating}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 font-medium text-xs transition border border-slate-700 flex items-center gap-1.5 disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Feedback alerts */}
        {message && (
          <div className="print:hidden mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="print:hidden mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* PRINTABLE INVOICE SHEET */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-10 shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-8 border-b border-slate-800 print:border-neutral-200">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                  B
                </div>
                <span className="text-xl font-bold tracking-tight text-white print:text-black">
                  Brightloop Software Inc.
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-neutral-500 leading-relaxed">
                100 Innovation Way, Suite 400<br />
                Silicon Valley, CA 94025<br />
                billing@brightloop.io • tax ID: US-9842104
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white print:text-black block">
                {invoice.invoiceNumber}
              </span>
              <div className="mt-2 flex sm:justify-end gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    invoice.status === "PAID"
                      ? "bg-emerald-500/20 text-emerald-300 print:border print:border-neutral-300"
                      : invoice.isOverdue
                      ? "bg-rose-500/20 text-rose-300"
                      : "bg-blue-500/20 text-blue-300"
                  }`}
                >
                  {invoice.isOverdue ? "OVERDUE" : invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Bill To & Invoice Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-800 print:border-neutral-200 text-xs">
            <div>
              <span className="text-[11px] font-semibold uppercase text-slate-400 print:text-neutral-500 block mb-1">
                Billed To:
              </span>
              <h3 className="text-base font-bold text-white print:text-black">{invoice.customer?.name}</h3>
              {invoice.customer?.company && (
                <div className="text-slate-300 print:text-neutral-700 font-medium">{invoice.customer.company}</div>
              )}
              <div className="text-slate-400 print:text-neutral-500 mt-1">{invoice.customer?.email}</div>
              {invoice.customer?.address && (
                <div className="text-slate-400 print:text-neutral-500">{invoice.customer.address}</div>
              )}
            </div>

            <div className="sm:text-right space-y-1.5">
              <div className="flex justify-between sm:justify-end gap-4">
                <span className="text-slate-400 print:text-neutral-500">Invoice Date:</span>
                <span className="text-white print:text-black font-medium">{formatDate(invoice.issueDate)}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-4">
                <span className="text-slate-400 print:text-neutral-500">Payment Due:</span>
                <span className="text-white print:text-black font-semibold">{formatDate(invoice.dueDate)}</span>
              </div>
              {invoice.subscription && (
                <div className="flex justify-between sm:justify-end gap-4">
                  <span className="text-slate-400 print:text-neutral-500">Subscription Ref:</span>
                  <span className="font-mono text-indigo-400 print:text-black">
                    {invoice.subscription.subscriptionNumber}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 print:bg-neutral-100 text-slate-300 print:text-neutral-700 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Description</th>
                  <th className="px-4 py-2.5 font-semibold text-center w-16">Qty</th>
                  <th className="px-4 py-2.5 font-semibold">Unit Price</th>
                  <th className="px-4 py-2.5 font-semibold">Discount</th>
                  <th className="px-4 py-2.5 font-semibold">Tax</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-neutral-200">
                {invoice.lines?.map((line: any) => (
                  <tr key={line.id}>
                    <td className="px-4 py-3.5 font-medium text-white print:text-black">
                      {line.description}
                      {line.variantSurcharge > 0 && (
                        <span className="block text-[11px] text-indigo-400 print:text-neutral-500 font-normal">
                          Includes variant surcharge: +{formatCurrency(line.variantSurcharge)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center text-slate-300 print:text-black">{line.quantity}</td>
                    <td className="px-4 py-3.5 text-slate-300 print:text-black">{formatCurrency(line.unitPrice)}</td>
                    <td className="px-4 py-3.5 text-slate-300 print:text-black">
                      {line.discountAmount > 0 ? `-${formatCurrency(line.discountAmount)}` : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-slate-300 print:text-black">
                      {line.taxAmount > 0 ? `+${formatCurrency(line.taxAmount)}` : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-white print:text-black">
                      {formatCurrency(line.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="pt-4 border-t border-slate-800 print:border-neutral-200 flex justify-end">
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400 print:text-neutral-600">
                <span>Subtotal:</span>
                <span className="font-medium text-white print:text-black">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 print:text-neutral-700">
                  <span>Discounts:</span>
                  <span>-{formatCurrency(invoice.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400 print:text-neutral-600">
                <span>Taxes & GST:</span>
                <span className="font-medium text-white print:text-black">+{formatCurrency(invoice.taxAmount)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 print:border-neutral-300 flex justify-between text-base font-bold text-white print:text-black">
                <span>Invoice Total:</span>
                <span className="text-emerald-400 print:text-black">{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 print:text-neutral-700 pt-1">
                <span>Amount Paid:</span>
                <span className="text-white print:text-black">{formatCurrency(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-800/60 print:border-neutral-200">
                <span>Balance Due:</span>
                <span className={invoice.balanceDue > 0 ? "text-amber-400 print:text-black" : "text-emerald-400"}>
                  {formatCurrency(invoice.balanceDue)}
                </span>
              </div>
            </div>
          </div>

          {/* Payments Received History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-800 print:border-neutral-200">
              <h4 className="text-xs font-semibold uppercase text-slate-400 print:text-neutral-600 mb-3 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                Payments Recorded ({invoice.payments.length})
              </h4>
              <div className="space-y-2">
                {invoice.payments.map((p: any) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-800/50 print:bg-neutral-50 border border-slate-700/50 print:border-neutral-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono text-white print:text-black font-semibold">{p.paymentNumber}</span>
                      <span className="text-slate-400 print:text-neutral-500 ml-2">via {p.paymentMethod}</span>
                      {p.transactionReference && (
                        <span className="text-[11px] text-slate-500 ml-2">Ref: {p.transactionReference}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-400 print:text-black">{formatCurrency(p.amount)}</span>
                      <span className="block text-[10px] text-slate-400 print:text-neutral-500">
                        {formatDate(p.paymentDate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-slate-800 print:border-neutral-200 text-xs text-slate-400 print:text-neutral-500">
            <span className="font-semibold text-white print:text-black block mb-1">Payment Instructions:</span>
            <p>
              Please wire payments to Silicon Valley Bank • Account: 9812-4410-09 • Routing: 121000358.<br />
              Reference Invoice Number <strong>{invoice.invoiceNumber}</strong> with remittance. Thank you for partnering with Brightloop!
            </p>
          </div>
        </div>

        {/* RECORD PAYMENT MODAL */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Record Payment</h3>
                  <p className="text-xs text-slate-400">Match incoming payment against {invoice.invoiceNumber}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 mb-4 flex justify-between items-center text-xs">
                <span className="text-slate-400">Current Outstanding Balance:</span>
                <span className="text-base font-bold text-amber-400">{formatCurrency(invoice.balanceDue)}</span>
              </div>

              <form onSubmit={handleRecordPayment} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold uppercase text-slate-300">Payment Amount ($)</label>
                    <button
                      type="button"
                      onClick={() => setPaymentAmount(invoice.balanceDue.toString())}
                      className="text-[11px] text-indigo-400 hover:underline"
                    >
                      Pay Full Balance
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    max={invoice.balanceDue}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="BANK_TRANSFER">Bank Wire / ACH Transfer</option>
                    <option value="CREDIT_CARD">Credit / Debit Card</option>
                    <option value="STRIPE">Stripe Payment Gateway</option>
                    <option value="CASH">Cash / UPI</option>
                    <option value="CHECK">Check</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Payment Date</label>
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Ref / Check #</label>
                    <input
                      type="text"
                      placeholder="e.g. TXN-98421"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Cleared in Silicon Valley Bank statement"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={recordingPayment}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow disabled:opacity-50"
                  >
                    {recordingPayment ? "Saving..." : "Confirm Payment"}
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
