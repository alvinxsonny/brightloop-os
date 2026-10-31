"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  XCircle,
  CreditCard,
  AlertCircle,
  DollarSign,
  Download,
  X,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/components/ToastProvider";
import InvoiceQRCode from "@/components/InvoiceQRCode";

export default function InvoiceDetailPage() {
  const { toast } = useToast();
  const { formatCurrency, currency } = useCurrency();
  const params = useParams();
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

  const handleDownloadPdf = () => {
    const originalTitle = document.title;
    document.title = `Invoice-${invoice?.invoiceNumber || "BrightLoop"}.pdf`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar user={user} />
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
          Loading invoice details...
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar user={user} />
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
          <p className="text-lg text-slate-900 font-semibold mb-2">Invoice Not Found</p>
          <Link href="/app/invoices" className="text-xs text-indigo-600 hover:underline">
            Return to Invoices List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-900 flex flex-col">
      <div className="print:hidden">
        <Navbar user={user} />
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8 w-full flex-1 md:pl-28">
        {/* Navigation & Action Bar */}
        <div className="print:hidden mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/app/invoices"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Invoices
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              title="Download formal PDF invoice"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition border border-slate-300 shadow-sm flex items-center gap-1.5 cursor-pointer"
              title="Print Invoice"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>

            {invoice.balanceDue > 0 && invoice.status !== "CANCELLED" && (
              <button
                onClick={() => {
                  setPaymentAmount(invoice.balanceDue.toString());
                  setShowPaymentModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Record Payment
              </button>
            )}

            {invoice.status === "DRAFT" && (
              <button
                onClick={() => handleUpdateStatus("CONFIRM")}
                disabled={updating}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confirm Invoice
              </button>
            )}

            {invoice.status !== "CANCELLED" && invoice.status !== "PAID" && (
              <button
                onClick={() => handleUpdateStatus("CANCEL")}
                disabled={updating}
                className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-medium text-xs transition border border-slate-300 flex items-center gap-1.5 disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Feedback alerts */}
        {message && (
          <div className="print:hidden mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="print:hidden mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* PRINTABLE INVOICE SHEET */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-sm print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-8 border-b border-slate-200">
            <div>
              <div className="mb-2">
                <img src="/logo.png" alt="BrightLoop" className="h-9 w-auto object-contain mix-blend-multiply" />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                100 Innovation Way, Suite 400<br />
                Silicon Valley, CA 94025<br />
                billing@brightloop.io • tax ID: US-9842104
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 block">
                {invoice.invoiceNumber}
              </span>
              <div className="mt-2 flex sm:justify-end gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${
                    invoice.status === "PAID"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : invoice.isOverdue
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {invoice.isOverdue ? "OVERDUE" : invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Bill To & Invoice Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs">
            <div>
              <span className="text-[11px] font-semibold uppercase text-slate-500 block mb-1">
                Billed To:
              </span>
              <h3 className="text-base font-bold text-slate-900">{invoice.customer?.name}</h3>
              {invoice.customer?.company && (
                <div className="text-slate-700 font-medium">{invoice.customer.company}</div>
              )}
              <div className="text-slate-500 mt-1">{invoice.customer?.email}</div>
              {invoice.customer?.address && (
                <div className="text-slate-500">{invoice.customer.address}</div>
              )}
            </div>

            <div className="sm:text-right space-y-1.5">
              <div className="flex justify-between sm:justify-end gap-4">
                <span className="text-slate-500">Invoice Date:</span>
                <span className="text-slate-900 font-medium">{formatDate(invoice.issueDate)}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-4">
                <span className="text-slate-500">Payment Due:</span>
                <span className="text-slate-900 font-semibold">{formatDate(invoice.dueDate)}</span>
              </div>
              {invoice.subscription && (
                <div className="flex justify-between sm:justify-end gap-4">
                  <span className="text-slate-500">Subscription Ref:</span>
                  <span className="font-mono text-indigo-600 font-medium">
                    {invoice.subscription.subscriptionNumber}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Description</th>
                  <th className="px-4 py-2.5 font-semibold text-center w-16">Qty</th>
                  <th className="px-4 py-2.5 font-semibold">Unit Price</th>
                  <th className="px-4 py-2.5 font-semibold">Discount</th>
                  <th className="px-4 py-2.5 font-semibold">Tax</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.lines?.map((line: any) => (
                  <tr key={line.id}>
                    <td className="px-4 py-3.5 font-medium text-slate-900">
                      {line.description}
                      {line.variantSurcharge > 0 && (
                        <span className="block text-[11px] text-indigo-600 font-normal">
                          Includes variant surcharge: +{formatCurrency(line.variantSurcharge)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center text-slate-600">{line.quantity}</td>
                    <td className="px-4 py-3.5 text-slate-600">{formatCurrency(line.unitPrice)}</td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {line.discountAmount > 0 ? `-${formatCurrency(line.discountAmount)}` : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {line.taxAmount > 0 ? `+${formatCurrency(line.taxAmount)}` : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                      {formatCurrency(line.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <div className="w-full sm:w-80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-medium text-slate-900 tabular-nums whitespace-nowrap">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discounts:</span>
                  <span className="tabular-nums whitespace-nowrap">-{formatCurrency(invoice.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Taxes:</span>
                <span className="font-medium text-slate-900 tabular-nums whitespace-nowrap">+{formatCurrency(invoice.taxAmount)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
                <span>Invoice Total:</span>
                <span className="text-emerald-700 tabular-nums whitespace-nowrap">{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 pt-1">
                <span>Amount Paid:</span>
                <span className="text-slate-900 tabular-nums whitespace-nowrap">{formatCurrency(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-100">
                <span>Balance Due:</span>
                <span className={`tabular-nums whitespace-nowrap ${invoice.balanceDue > 0 ? "text-amber-600 font-extrabold" : "text-emerald-600 font-bold"}`}>
                  {formatCurrency(invoice.balanceDue)}
                </span>
              </div>
            </div>
          </div>

          {/* Payments Received History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h4 className="text-xs font-semibold uppercase text-slate-500 mb-3 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                Payments Recorded ({invoice.payments.length})
              </h4>
              <div className="space-y-2">
                {invoice.payments.map((p: any) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono text-slate-900 font-semibold">{p.paymentNumber}</span>
                      <span className="text-slate-500 ml-2">via {p.paymentMethod}</span>
                      {p.transactionReference && (
                        <span className="text-[11px] text-slate-400 ml-2">Ref: {p.transactionReference}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600 tabular-nums whitespace-nowrap">{formatCurrency(p.amount)}</span>
                      <span className="block text-[10px] text-slate-400">
                        {formatDate(p.paymentDate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Instructions & Optional Payment QR Code */}
          <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs items-start">
            <div className="text-slate-500 space-y-2">
              <span className="font-semibold text-slate-900 block text-xs">Payment Instructions:</span>
              <p className="leading-relaxed">
                Please wire payments to Silicon Valley Bank<br />
                Account: <strong className="text-slate-800">9812-4410-09</strong><br />
                Routing: <strong className="text-slate-800">121000358</strong>
              </p>
              <p className="leading-relaxed">
                Reference Invoice Number <strong className="text-slate-900 font-mono">{invoice.invoiceNumber}</strong> with remittance. Thank you for partnering with Brightloop!
              </p>
            </div>

            <div>
              <InvoiceQRCode
                invoiceNumber={invoice.invoiceNumber}
                amount={invoice.balanceDue}
                formattedAmount={formatCurrency(invoice.balanceDue)}
                currencyCode={currency}
              />
            </div>
          </div>
        </div>

        {/* RECORD PAYMENT MODAL */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Record Payment</h3>
                  <p className="text-xs text-slate-500">Match incoming payment against {invoice.invoiceNumber}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-4 flex justify-between items-center text-xs">
                <span className="text-slate-500">Current Outstanding Balance:</span>
                <span className="text-base font-bold text-amber-600">{formatCurrency(invoice.balanceDue)}</span>
              </div>

              <form onSubmit={handleRecordPayment} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold uppercase text-slate-600">Payment Amount ($)</label>
                    <button
                      type="button"
                      onClick={() => setPaymentAmount(invoice.balanceDue.toString())}
                      className="text-[11px] text-indigo-600 hover:underline font-medium"
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
                    className="w-full px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Payment Date</label>
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Ref / Check #</label>
                    <input
                      type="text"
                      placeholder="e.g. TXN-98421"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Cleared in Silicon Valley Bank statement"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={recordingPayment}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm disabled:opacity-50"
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
