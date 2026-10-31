"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Tag, Percent, Plus, CheckCircle2, AlertCircle, X, Shield, Calendar, DollarSign } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminRulesPage() {
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<"discounts" | "taxes">("discounts");
  const [discountRules, setDiscountRules] = useState<any[]>([]);
  const [taxRules, setTaxRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Discount modal state
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [dCode, setDCode] = useState("");
  const [dName, setDName] = useState("");
  const [dType, setDType] = useState("PERCENTAGE");
  const [dValue, setDValue] = useState("");
  const [dMinQty, setDMinQty] = useState("");
  const [dMinSpend, setDMinSpend] = useState("");
  const [dLimit, setDLimit] = useState("");
  const [dAppliesTo, setDAppliesTo] = useState("SUBSCRIPTION");

  // Tax modal state
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 mb-2">
              <Shield className="w-3.5 h-3.5" />
              Admin Rule Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Taxes & Discount Rules
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Admin-controlled automated calculation rules for billing runs, volume discounts, and GST/VAT.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {tab === "discounts" ? (
              <button
                onClick={() => setShowDiscountModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow transition"
              >
                <Plus className="w-4 h-4" />
                Add Discount Rule
              </button>
            ) : (
              <button
                onClick={() => setShowTaxModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm shadow transition"
              >
                <Plus className="w-4 h-4" />
                Add Tax Rule
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab switch */}
        <div className="mt-6 flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setTab("discounts")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              tab === "discounts"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Tag className="w-4 h-4" />
            Discount Rules ({discountRules.length})
          </button>
          <button
            onClick={() => setTab("taxes")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              tab === "taxes"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Percent className="w-4 h-4" />
            Tax Rules ({taxRules.length})
          </button>
        </div>

        {/* DISCOUNTS TAB */}
        {tab === "discounts" && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {discountRules.map((disc) => (
              <div
                key={disc.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold text-white bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                      {disc.code}
                    </span>
                    <span className="text-base font-bold text-emerald-400">
                      {disc.type === "PERCENTAGE" ? `${disc.value}% OFF` : `$${disc.value} OFF`}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-2">{disc.name}</h3>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Applies To:</span>
                      <span className="font-medium text-white">{disc.appliesTo}</span>
                    </div>
                    {disc.minQuantity && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Min Quantity:</span>
                        <span className="font-medium text-white">{disc.minQuantity} units</span>
                      </div>
                    )}
                    {disc.minPurchaseAmount && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Min Spend:</span>
                        <span className="font-medium text-white">${disc.minPurchaseAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Usage Tracker:</span>
                      <span className="font-medium text-indigo-300">
                        {disc.timesUsed} / {disc.usageLimit ? `${disc.usageLimit} max` : "unlimited"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
                  <span>Auto-applied on billing day</span>
                  <span className="text-emerald-400">Active</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAX RULES TAB */}
        {tab === "taxes" && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {taxRules.map((tax) => (
              <div
                key={tax.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-black text-white">{tax.rate}%</span>
                    {tax.isDefault && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Default Rule
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{tax.name}</h3>
                  {tax.description && <p className="text-xs text-slate-400 mt-1">{tax.description}</p>}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
                  <span>Created {formatDate(tax.createdAt)}</span>
                  <span className="text-emerald-400">Active</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CREATE DISCOUNT MODAL */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setShowDiscountModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Create Discount Rule</h3>
            <p className="text-xs text-slate-400 mb-4">Set percentage/fixed rules with quantity thresholds</p>

            <form onSubmit={handleCreateDiscount} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={dCode}
                    onChange={(e) => setDCode(e.target.value)}
                    placeholder="e.g. SEATS20"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={dName}
                    onChange={(e) => setDName(e.target.value)}
                    placeholder="e.g. Volume Seat Discount"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Type</label>
                  <select
                    value={dType}
                    onChange={(e) => setDType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Value</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={dValue}
                    onChange={(e) => setDValue(e.target.value)}
                    placeholder="e.g. 20 (for 20%)"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Min Quantity Seats</label>
                  <input
                    type="number"
                    value={dMinQty}
                    onChange={(e) => setDMinQty(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Usage Limit (Max Uses)</label>
                  <input
                    type="number"
                    value={dLimit}
                    onChange={(e) => setDLimit(e.target.value)}
                    placeholder="e.g. 50 (or leave empty)"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDiscountModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Discount Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TAX MODAL */}
      {showTaxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setShowTaxModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Create Tax Rule</h3>
            <p className="text-xs text-slate-400 mb-4">Set percentage rate for recurring billing calculation</p>

            <form onSubmit={handleCreateTax} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Tax Rule Name</label>
                <input
                  type="text"
                  required
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                  placeholder="e.g. Standard GST (18%)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={tRate}
                  onChange={(e) => setTRate(e.target.value)}
                  placeholder="18.0"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={tDescription}
                  onChange={(e) => setTDescription(e.target.value)}
                  placeholder="Applies to all domestic software subscriptions"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 pt-1">
                <input
                  type="checkbox"
                  checked={tDefault}
                  onChange={(e) => setTDefault(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span>Set as default tax rule for all new subscriptions</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTaxModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition shadow disabled:opacity-50"
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

