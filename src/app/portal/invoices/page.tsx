"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Receipt, ArrowRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CustomerInvoicesPage() {
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1">
        <div className="pb-6 border-b border-slate-200">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
            <Receipt className="w-3.5 h-3.5" />
            Billing Receipts
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            My Invoices & Statements
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review invoices, payment settlement status, and print formal tax receipts.
          </p>
        </div>

        <div className="mt-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
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
              <tbody className="divide-y divide-slate-100">
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
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 font-mono font-medium text-slate-900">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 text-slate-600 text-xs">{formatDate(inv.issueDate)}</td>
                      <td className="px-6 py-4 text-slate-600 text-xs">{formatDate(inv.dueDate)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            inv.status === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : inv.status === "CONFIRMED"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : inv.isOverdue
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {inv.isOverdue ? "OVERDUE" : inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{formatCurrency(inv.totalAmount)}</td>
                      <td className="px-6 py-4 font-medium">
                        {inv.balanceDue > 0 ? (
                          <span className={inv.isOverdue ? "text-rose-600 font-bold" : "text-amber-600"}>
                            {formatCurrency(inv.balanceDue)}
                          </span>
                        ) : (
                          <span className="text-emerald-600">Settled</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/app/invoices/${inv.id}`}
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
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
