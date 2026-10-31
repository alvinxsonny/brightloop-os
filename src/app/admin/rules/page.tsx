"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Tag, Percent, Plus, CheckCircle2, AlertCircle, X, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminRulesPage() {
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<"discounts" | "taxes">("discounts");
  const [discountRules, setDiscountRules] = useState<any[]>([]);
  const [taxRules, setTaxRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [dCode, setDCode] = useState("");
  const [dName, setDName] = useState("");
  const [dType, setDType] = useState("PERCENTAGE");
  const [dValue, setDValue] = useState("");
  const [dMinQty, setDMinQty] = useState("");
  const [dMinSpend, setDMinSpend] = useState("");
  const [dLimit, setDLimit] = useState("");
  const [dAppliesTo, setDAppliesTo] = useState("SUBSCRIPTION");

  const [showTaxModal, setShowTaxModal] = useState(false);
  const [tName, setTName] = useState("");
  const [tRate, setTRate] = useState("");
  const [tDefault, setTDefault] = useState(false);
  const [tDescription, setTDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const [uRes, dRes, tRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/billing/discount-rules"),
        fetch("/api/billing/tax-rules"),
      ]);

      const uData = await uRes.json();
      setUser(uData.user);

      const dData = await dRes.json();
      setDiscountRules(dData.discountRules || []);

      const tData = await tRes.json();
      setTaxRules(tData.taxRules || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/billing/discount-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: dCode,
          name: dName,
          type: dType,
          value: dValue,
          minQuantity: dMinQty || null,
          minPurchaseAmount: dMinSpend || null,
          usageLimit: dLimit || null,
          appliesTo: dAppliesTo,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create discount rule");

      setMessage(`Discount rule "${dCode}" created successfully!`);
      setShowDiscountModal(false);
      setDCode("");
      setDName("");
      setDValue("");
      setDMinQty("");
      setDMinSpend("");
      setDLimit("");
      fetchRules();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/billing/tax-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tName,
          rate: tRate,
          isDefault: tDefault,
          description: tDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create tax rule");

      setMessage(`Tax rule "${tName}" created successfully!`);
      setShowTaxModal(false);
      setTName("");
      setTRate("");
      setTDefault(false);
      setTDescription("");
      fetchRules();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 md:pl-28">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 mb-2">
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              Admin Rule Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Taxes & Discount Rules
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Admin-controlled automated calculation rules for billing runs, volume discounts, and GST/VAT.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {tab === "discounts" ? (
              <button
                onClick={() => setShowDiscountModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Discount Rule
              </button>
            ) : (
              <button
                onClick={() => setShowTaxModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Tax Rule
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setTab("discounts")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 cursor-pointer ${
              tab === "discounts"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Tag className="w-4 h-4" />
            Discount Rules ({discountRules.length})
          </button>
          <button
            onClick={() => setTab("taxes")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 cursor-pointer ${
              tab === "taxes"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Percent className="w-4 h-4" />
            Tax Rules ({taxRules.length})
          </button>
        </div>

        {tab === "discounts" && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {discountRules.map((disc) => (
              <div
                key={disc.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                      {disc.code}
                    </span>
                    <span className="text-sm font-bold text-emerald-700">
                      {disc.type === "PERCENTAGE" ? `${disc.value}% OFF` : `$${disc.value} OFF`}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mt-2">{disc.name}</h3>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Applies To:</span>
                      <span className="font-medium text-slate-800">{disc.appliesTo}</span>
                    </div>
                    {disc.minQuantity && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Min Quantity:</span>
                        <span className="font-medium text-slate-800">{disc.minQuantity} units</span>
                      </div>
                    )}
                    {disc.minPurchaseAmount && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Min Spend:</span>
                        <span className="font-medium text-slate-800">${disc.minPurchaseAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Usage Tracker:</span>
                      <span className="font-medium text-indigo-700">
                        {disc.timesUsed} / {disc.usageLimit ? `${disc.usageLimit} max` : "unlimited"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                  <span>Auto-applied on billing day</span>
                  <span className="text-emerald-700 font-medium">Active</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "taxes" && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {taxRules.map((tax) => (
              <div
                key={tax.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-slate-900">{tax.rate}%</span>
                    {tax.isDefault && (
                      <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Default Rule
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mt-1">{tax.name}</h3>
                  {tax.description && <p className="text-xs text-slate-500 mt-1">{tax.description}</p>}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                  <span>Created {formatDate(tax.createdAt)}</span>
                  <span className="text-emerald-700 font-medium">Active</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-xl relative">
            <button
              onClick={() => setShowDiscountModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Create Discount Rule</h3>
            <p className="text-xs text-slate-500 mb-4">Set percentage/fixed rules with quantity thresholds</p>

            <form onSubmit={handleCreateDiscount} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={dCode}
                    onChange={(e) => setDCode(e.target.value)}
                    placeholder="e.g. SEATS20"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono uppercase focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={dName}
                    onChange={(e) => setDName(e.target.value)}
                    placeholder="e.g. Volume Seat Discount"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Type</label>
                  <select
                    value={dType}
                    onChange={(e) => setDType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Value</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={dValue}
                    onChange={(e) => setDValue(e.target.value)}
                    placeholder="e.g. 20 (for 20%)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Min Quantity Seats</label>
                  <input
                    type="number"
                    value={dMinQty}
                    onChange={(e) => setDMinQty(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={dLimit}
                    onChange={(e) => setDLimit(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowDiscountModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Discount Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTaxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-xl relative">
            <button
              onClick={() => setShowTaxModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Create Tax Rule</h3>
            <p className="text-xs text-slate-500 mb-4">Set percentage rate for recurring billing calculation</p>

            <form onSubmit={handleCreateTax} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Tax Rule Name</label>
                <input
                  type="text"
                  required
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                  placeholder="e.g. Standard GST (18%)"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={tRate}
                  onChange={(e) => setTRate(e.target.value)}
                  placeholder="18.0"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={tDescription}
                  onChange={(e) => setTDescription(e.target.value)}
                  placeholder="Applies to all software subscriptions"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 pt-1">
                <input
                  type="checkbox"
                  checked={tDefault}
                  onChange={(e) => setTDefault(e.target.checked)}
                  className="rounded bg-slate-100 border-slate-300 text-indigo-600 focus:ring-0"
                />
                <span>Set as default tax rule for all new subscriptions</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowTaxModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Tax Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
