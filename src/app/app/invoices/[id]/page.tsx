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
  Send,
  Building,
  Calendar,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

      setMessage(data.message);
      setInvoice(data.invoice);
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
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
                Cancel Invoice
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

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-slate-800 print:border-neutral-200 text-xs text-slate-400 print:text-neutral-500">
            <span className="font-semibold text-white print:text-black block mb-1">Payment Instructions:</span>
            <p>
              Please wire payments to Silicon Valley Bank • Account: 9812-4410-09 • Routing: 121000358.<br />
              Reference Invoice Number <strong>{invoice.invoiceNumber}</strong> with remittance. Thank you for partnering with Brightloop!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
