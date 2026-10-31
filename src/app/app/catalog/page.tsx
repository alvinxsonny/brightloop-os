"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Layers, Plus, Package, Calendar, FileText, CheckCircle2, AlertCircle, X, Tag } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CatalogPage() {
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<"products" | "plans" | "templates">("products");
  const [products, setProducts] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [pName, setPName] = useState("");
  const [pType, setPType] = useState("SOFTWARE");
  const [pSalesPrice, setPSalesPrice] = useState("");
  const [pCostPrice, setPCostPrice] = useState("");
  const [pNotes, setPNotes] = useState("");
  const [pVariantName, setPVariantName] = useState("");
  const [pVariantSurcharge, setPVariantSurcharge] = useState("");

  // New Plan Modal State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [plName, setPlName] = useState("");
  const [plDescription, setPlDescription] = useState("");
  const [plFrequency, setPlFrequency] = useState("MONTHLY");
  const [plPrice, setPlPrice] = useState("");
  const [plMinQty, setPlMinQty] = useState("1");
  const [plAutoClose, setPlAutoClose] = useState(false);
  const [plAllowPause, setPlAllowPause] = useState(true);
  const [plAllowRenew, setPlAllowRenew] = useState(true);
  const [plAllowEarlyClose, setPlAllowEarlyClose] = useState(true);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const variants = pVariantName
        ? [{ name: pVariantName, surcharge: parseFloat(pVariantSurcharge || "0") }]
        : [];

      const res = await fetch("/api/catalog/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pName,
          type: pType,
          salesPrice: pSalesPrice,
          costPrice: pCostPrice || "0",
          notes: pNotes,
          variants,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create product");

      setMessage(`Product "${pName}" created successfully!`);
      setShowProductModal(false);
      setPName("");
      setPSalesPrice("");
      setPCostPrice("");
      setPNotes("");
      setPVariantName("");
      setPVariantSurcharge("");
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/catalog/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: plName,
          description: plDescription,
          frequency: plFrequency,
          price: plPrice,
          minQuantity: plMinQty,
          autoClose: plAutoClose,
          allowPause: plAllowPause,
          allowRenew: plAllowRenew,
          allowEarlyClose: plAllowEarlyClose,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create plan");

      setMessage(`Plan "${plName}" created successfully!`);
      setShowPlanModal(false);
      setPlName("");
      setPlDescription("");
      setPlPrice("");
      setPlMinQty("1");
      fetchData();
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-2">
              <Layers className="w-3.5 h-3.5" />
              Brightloop Catalog & Terms
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Products, Plans & Templates
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Configure subscription tiers, variant surcharges (e.g. Odoo brand +560), and reusable quote templates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowProductModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
            {user?.role === "ADMIN" && (
              <button
                onClick={() => setShowPlanModal(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                Add Billing Plan
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alerts */}
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

        {/* Tab Switcher */}
        <div className="mt-6 flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setTab("products")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              tab === "products"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Package className="w-4 h-4" />
            Products & Variants ({products.length})
          </button>
          <button
            onClick={() => setTab("plans")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              tab === "plans"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Billing Plans ({plans.length})
          </button>
          <button
            onClick={() => setTab("templates")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              tab === "templates"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            Quotation Templates ({templates.length})
          </button>
        </div>

        {/* TAB 1: Products */}
        {tab === "products" && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">
                      {prod.type}
                    </span>
                    <span className="text-lg font-bold text-white">{formatCurrency(prod.salesPrice)}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{prod.name}</h3>
                  {prod.notes && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{prod.notes}</p>}

                  {/* Variants */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <span className="text-[11px] font-semibold uppercase text-slate-400 flex items-center gap-1 mb-2">
                      <Tag className="w-3 h-3 text-indigo-400" />
                      Variants ({prod.variants?.length || 0})
                    </span>
                    {prod.variants && prod.variants.length > 0 ? (
                      <div className="space-y-1.5">
                        {prod.variants.map((v: any) => (
                          <div
                            key={v.id}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs"
                          >
                            <span className="text-slate-200 font-medium">{v.name}</span>
                            <span className="text-emerald-400 font-semibold">
                              +{formatCurrency(v.surcharge)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic">No variants configured</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
                  <span>Cost: {formatCurrency(prod.costPrice)}</span>
                  <span>Margin: {formatCurrency(prod.salesPrice - prod.costPrice)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: Plans */}
        {tab === "plans" && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans.map((pl) => (
              <div
                key={pl.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {pl.frequency}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Min Qty: {pl.minQuantity}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{pl.name}</h3>
                  {pl.description && <p className="text-xs text-slate-400 mt-1">{pl.description}</p>}

                  {/* Lifecycle Rules */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                    <div className="text-[11px] font-semibold uppercase text-slate-400 mb-1">Lifecycle Rules:</div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Auto-close when expired:</span>
                      <span className={pl.autoClose ? "text-amber-400 font-semibold" : "text-slate-500"}>
                        {pl.autoClose ? "Yes (Strict End)" : "No (Auto-Renews)"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Allow Pause:</span>
                      <span className={pl.allowPause ? "text-emerald-400" : "text-rose-400"}>
                        {pl.allowPause ? "Allowed" : "Disallowed"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Allow Early Close:</span>
                      <span className={pl.allowEarlyClose ? "text-emerald-400" : "text-rose-400"}>
                        {pl.allowEarlyClose ? "Allowed" : "Disallowed"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Allow Renewal:</span>
                      <span className={pl.allowRenew ? "text-emerald-400" : "text-rose-400"}>
                        {pl.allowRenew ? "Allowed" : "Disallowed"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>{pl._count?.subscriptions || 0} active subscriptions</span>
                  {pl.price > 0 && <span className="font-semibold text-white">{formatCurrency(pl.price)} base</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: Templates */}
        {tab === "templates" && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white">{tpl.name}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Valid for {tpl.validityDays} days
                  </span>
                </div>
                {tpl.description && <p className="text-xs text-slate-400 mb-3">{tpl.description}</p>}
                {tpl.plan && (
                  <div className="text-xs text-slate-300 mb-3">
                    Preset Plan: <strong className="text-white">{tpl.plan.name}</strong> ({tpl.plan.frequency})
                  </div>
                )}

                <div className="mt-2 pt-3 border-t border-slate-800">
                  <div className="text-[11px] font-semibold uppercase text-slate-400 mb-2">Pre-filled Lines:</div>
                  <div className="space-y-1.5">
                    {tpl.lines.map((l: any) => (
                      <div
                        key={l.id}
                        className="p-2 rounded-lg bg-slate-800/60 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-medium text-white">{l.product.name}</span>
                          {l.variant && (
                            <span className="ml-1 text-[11px] text-indigo-300">({l.variant.name})</span>
                          )}
                          <span className="text-slate-400 ml-2">x{l.quantity}</span>
                        </div>
                        <span className="font-semibold text-emerald-400">
                          {formatCurrency(l.unitPrice * l.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CREATE PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Add New Product</h3>
            <p className="text-xs text-slate-400 mb-4">Create product with optional variant pricing</p>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="e.g. Enterprise Cloud Suite"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Type</label>
                  <select
                    value={pType}
                    onChange={(e) => setPType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="SOFTWARE">Software</option>
                    <option value="SERVICE">Service</option>
                    <option value="ADDON">Add-on</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Sales Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={pSalesPrice}
                    onChange={(e) => setPSalesPrice(e.target.value)}
                    placeholder="1000.00"
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Cost Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={pCostPrice}
                  onChange={(e) => setPCostPrice(e.target.value)}
                  placeholder="200.00"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Notes</label>
                <textarea
                  value={pNotes}
                  onChange={(e) => setPNotes(e.target.value)}
                  placeholder="Internal description, terms or notes"
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Variant Section: Brightloop requirement (e.g. Odoo brand +560) */}
              <div className="p-3.5 rounded-xl bg-slate-800/70 border border-indigo-500/30">
                <div className="text-xs font-semibold text-indigo-300 mb-2">Variant / Brand Surcharge (Optional)</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Variant Name</label>
                    <input
                      type="text"
                      value={pVariantName}
                      onChange={(e) => setPVariantName(e.target.value)}
                      placeholder="e.g. Odoo Brand"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Surcharge Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={pVariantSurcharge}
                      onChange={(e) => setPVariantSurcharge(e.target.value)}
                      placeholder="e.g. 560"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PLAN MODAL */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPlanModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Create Billing Plan</h3>
            <p className="text-xs text-slate-400 mb-4">Set frequency, min quantity, and lifecycle policies</p>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  value={plName}
                  onChange={(e) => setPlName(e.target.value)}
                  placeholder="e.g. Growth Monthly, Enterprise Yearly"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Billing Frequency</label>
                  <select
                    value={plFrequency}
                    onChange={(e) => setPlFrequency(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Minimum Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={plMinQty}
                    onChange={(e) => setPlMinQty(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Description</label>
                <textarea
                  value={plDescription}
                  onChange={(e) => setPlDescription(e.target.value)}
                  placeholder="Brief details about the plan"
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Lifecycle flags */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2 text-xs">
                <div className="font-semibold text-slate-300 mb-1">Lifecycle Policies:</div>
                <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                  <input
                    type="checkbox"
                    checked={plAutoClose}
                    onChange={(e) => setPlAutoClose(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Close on its own when end date is reached (auto-close)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                  <input
                    type="checkbox"
                    checked={plAllowPause}
                    onChange={(e) => setPlAllowPause(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Allow customer / staff to pause subscription</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                  <input
                    type="checkbox"
                    checked={plAllowRenew}
                    onChange={(e) => setPlAllowRenew(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Allow subscription renewal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                  <input
                    type="checkbox"
                    checked={plAllowEarlyClose}
                    onChange={(e) => setPlAllowEarlyClose(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Allow closing early before scheduled expiry</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition shadow disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Save Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
