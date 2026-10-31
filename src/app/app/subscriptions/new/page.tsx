"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Zap, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface LineItem {
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  variantSurcharge: number;
  discountRate: number;
  taxRate: number;
}

export default function NewSubscriptionPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const [customers, setCustomers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [planId, setPlanId] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("NET30");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineItem[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [uRes, prodRes, planRes, tempRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/catalog/products"),
        fetch("/api/catalog/plans"),
        fetch("/api/templates"),
      ]);

      const uData = await uRes.json();
      setUser(uData.user);

      const prodData = await prodRes.json();
      setProducts(prodData.products || []);

      const planData = await planRes.json();
      setPlans(planData.plans || []);

      const tempData = await tempRes.json();
      setTemplates(tempData.templates || []);

      setCustomerId("seeded-customer-1");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    if (!tmplId) return;

    const tmpl = templates.find((t) => t.id === tmplId);
    if (!tmpl) return;

    if (tmpl.planId) {
      setPlanId(tmpl.planId);
    }

    const exp = new Date();
    exp.setDate(exp.getDate() + (tmpl.validityDays || 30));
    setExpiryDate(exp.toISOString().split("T")[0]);

    const newLines: LineItem[] = (tmpl.lines || []).map((l: any) => {
      const product = products.find((p) => p.id === l.productId);
      const variant = product?.variants?.find((v: any) => v.id === l.variantId);
      return {
        productId: l.productId,
        variantId: l.variantId || "",
        quantity: l.quantity || 1,
        unitPrice: l.unitPrice || product?.salesPrice || 0,
        variantSurcharge: variant?.surcharge || 0,
        discountRate: l.discountPercent || 0,
        taxRate: 18.0,
      };
    });

    setLines(newLines);
  };

  const addLine = () => {
    if (products.length === 0) return;
    const defaultProduct = products[0];
    setLines([
      ...lines,
      {
        productId: defaultProduct.id,
        variantId: "",
        quantity: 1,
        unitPrice: defaultProduct.salesPrice,
        variantSurcharge: 0,
        discountRate: 0,
        taxRate: 18.0,
      },
    ]);
  };

  const updateLine = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lines];
    const current = { ...updated[index], [field]: value };

    if (field === "productId") {
      const prod = products.find((p) => p.id === value);
      current.unitPrice = prod ? prod.salesPrice : 0;
      current.variantId = "";
      current.variantSurcharge = 0;
    }

    if (field === "variantId") {
      const prod = products.find((p) => p.id === current.productId);
      const variant = prod?.variants?.find((v: any) => v.id === value);
      current.variantSurcharge = variant ? variant.surcharge : 0;
    }

    updated[index] = current;
    setLines(updated);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const subtotal = lines.reduce((acc, l) => acc + (l.unitPrice + l.variantSurcharge) * (l.quantity || 1), 0);
  const totalDiscount = lines.reduce(
    (acc, l) => acc + ((l.unitPrice + l.variantSurcharge) * (l.quantity || 1) * (l.discountRate || 0)) / 100,
    0
  );
  const taxableAmount = subtotal - totalDiscount;
  const totalTax = lines.reduce((acc, l) => {
    const lineBase = (l.unitPrice + l.variantSurcharge) * (l.quantity || 1) * (1 - (l.discountRate || 0) / 100);
    return acc + (lineBase * (l.taxRate || 0)) / 100;
  }, 0);
  const grandTotal = taxableAmount + totalTax;

  const handleSubmit = async (targetStatus: "DRAFT" | "QUOTATION") => {
    setSubmitting(true);
    setError(null);

    try {
      if (!planId) throw new Error("Please select a billing plan.");
      if (lines.length === 0) throw new Error("Please add at least one product line item.");

      const selectedPlan = plans.find((p) => p.id === planId);
      const totalQty = lines.reduce((sum, l) => sum + (Number(l.quantity) || 1), 0);
      if (selectedPlan && totalQty < selectedPlan.minQuantity) {
        throw new Error(
          `Plan "${selectedPlan.name}" requires minimum quantity of ${selectedPlan.minQuantity}. Current total is ${totalQty}.`
        );
      }

      const finalCustomerId = customerId.startsWith("seeded") ? undefined : customerId;

      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: finalCustomerId || "seeded",
          planId,
          status: targetStatus,
          startDate,
          expiryDate: expiryDate || null,
          paymentTerms,
          notes,
          lines,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create subscription offer");

      router.push(`/app/subscriptions/${data.subscription.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

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

        <div className="pb-6 border-b border-slate-200">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Create Quotation / Subscription
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Start from a quotation template or build custom product lines with dynamic variants.
          </p>
        </div>

        {error && (
          <div className="mt-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">Quotation Template Preset</div>
              <div className="text-xs text-slate-500">Pre-fill terms and product lines instantly</div>
            </div>
          </div>

          <div className="w-full sm:w-72">
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Choose Template (Optional) --</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Valid {t.validityDays}d)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 mb-4 pb-2 border-b border-slate-100">
            Contract Terms
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">Customer</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option value="seeded-customer-1">Acme Corporation (customer@acme.com)</option>
                <option value="seeded-customer-2">Local Bakery (shop@localbakery.com)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">Billing Plan</label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option value="">-- Select Billing Plan --</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.frequency}) - Min Qty: {p.minQuantity}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option value="NET30">Net 30 Days</option>
                <option value="NET15">Net 15 Days</option>
                <option value="IMMEDIATE">Due on Receipt (Immediate)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Special enterprise pricing agreed"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
              Product & Add-on Lines ({lines.length})
            </h2>
            <button
              type="button"
              onClick={addLine}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Product Line
            </button>
          </div>

          {lines.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No product lines added yet. Click &quot;Add Product Line&quot; or select a Quotation Template above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2.5">Product</th>
                    <th className="px-3 py-2.5">Variant</th>
                    <th className="px-3 py-2.5 w-20">Qty</th>
                    <th className="px-3 py-2.5">Unit Price</th>
                    <th className="px-3 py-2.5">Disc %</th>
                    <th className="px-3 py-2.5">Tax %</th>
                    <th className="px-3 py-2.5 text-right">Subtotal</th>
                    <th className="px-3 py-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lines.map((line, idx) => {
                    const prod = products.find((p) => p.id === line.productId);
                    const lineTotal =
                      (line.unitPrice + line.variantSurcharge) *
                      line.quantity *
                      (1 - line.discountRate / 100) *
                      (1 + line.taxRate / 100);

                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-3 py-3">
                          <select
                            value={line.productId}
                            onChange={(e) => updateLine(idx, "productId", e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-3 py-3">
                          <select
                            value={line.variantId}
                            onChange={(e) => updateLine(idx, "variantId", e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs"
                          >
                            <option value="">No Variant (+0)</option>
                            {prod?.variants?.map((v: any) => (
                              <option key={v.id} value={v.id}>
                                {v.name} (+{formatCurrency(v.surcharge)})
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-3 py-3">
                          <input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) => updateLine(idx, "quantity", parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs text-center"
                          />
                        </td>

                        <td className="px-3 py-3 font-medium text-slate-700">
                          {formatCurrency(line.unitPrice)}
                          {line.variantSurcharge > 0 && (
                            <span className="text-indigo-600 block text-[10px]">
                              +{formatCurrency(line.variantSurcharge)}
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-3">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={line.discountRate}
                            onChange={(e) => updateLine(idx, "discountRate", parseFloat(e.target.value) || 0)}
                            className="w-14 px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs text-center"
                          />
                        </td>

                        <td className="px-3 py-3">
                          <input
                            type="number"
                            min="0"
                            value={line.taxRate}
                            onChange={(e) => updateLine(idx, "taxRate", parseFloat(e.target.value) || 0)}
                            className="w-14 px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs text-center"
                          />
                        </td>

                        <td className="px-3 py-3 text-right font-bold text-slate-900">
                          {formatCurrency(lineTotal)}
                        </td>

                        <td className="px-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeLine(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col items-end">
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discounts Applied:</span>
                  <span>-{formatCurrency(totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Taxes & GST:</span>
                <span className="font-medium text-slate-900">+{formatCurrency(totalTax)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
                <span>Recurring Total:</span>
                <span className="text-emerald-700">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Link
            href="/app/subscriptions"
            className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm transition"
          >
            Cancel
          </Link>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit("DRAFT")}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium text-sm transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit("QUOTATION")}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Generating..." : "Generate Quotation Offer"}
          </button>
        </div>
      </main>
    </div>
  );
}
