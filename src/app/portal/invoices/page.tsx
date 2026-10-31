"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Receipt, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";

export default function CustomerInvoicesPage() {
  const { formatCurrency } = useCurrency();
  const [user, setUser] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const [uRes, iRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/invoices"),
      ]);

      const uData = await uRes.json();
      setUser(uData.user);

      const iData = await iRes.json();
      setInvoices(iData.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-900 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 md:pl-28">
        <div className="p-6 rounded-3xl glass-panel mb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 mb-2">
            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
            Billing Receipts
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            My Invoices & Statements
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review invoices, payment settlement status, and print formal tax receipts.
          </p>
        </div>

        <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-emerald-50/50 text-slate-600 text-xs uppercase tracking-wider border-b border-emerald-500/10">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Invoice #</th>
                  <th className="px-6 py-3.5 font-semibold">Issue Date</th>
                  <th className="px-6 py-3.5 font-semibold">Due Date</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold">Total Amount</th>
                  <th className="px-6 py-3.5 font-semibold">Balance Due</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/10">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-500 text-xs">
                      Loading invoices...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-500 text-xs">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-emerald-50/40 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 text-slate-600 text-xs">{formatDate(inv.issueDate)}</td>
                      <td className="px-6 py-4 text-slate-600 text-xs">{formatDate(inv.dueDate)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            inv.status === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : inv.status === "CONFIRMED"
                              ? "bg-teal-50 text-teal-700 border-teal-200"
                              : inv.isOverdue
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {inv.isOverdue ? "OVERDUE" : inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 tabular-nums whitespace-nowrap">{formatCurrency(inv.totalAmount)}</td>
                      <td className="px-6 py-4 font-semibold tabular-nums whitespace-nowrap">
                        {inv.balanceDue > 0 ? (
                          <span className={inv.isOverdue ? "text-rose-600 font-bold" : "text-amber-600"}>
                            {formatCurrency(inv.balanceDue)}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold">Settled</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/app/invoices/${inv.id}`}
                          className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
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
