"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Layers, Plus, Package, Calendar, FileText, CheckCircle2, AlertCircle, X, Tag } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";

export default function CatalogPage() {
  const { formatCurrency } = useCurrency();
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<"products" | "plans" | "templates">("products");
  const [products, setProducts] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showProductModal, setShowProductModal] = useState(false);
  const [pName, setPName] = useState("");
  const [pType, setPType] = useState("SOFTWARE");
  const [pSalesPrice, setPSalesPrice] = useState("");
  const [pCostPrice, setPCostPrice] = useState("");
  const [pNotes, setPNotes] = useState("");
  const [pVariantName, setPVariantName] = useState("");
  const [pVariantSurcharge, setPVariantSurcharge] = useState("");

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 md:pl-28">
        <div className="p-6 rounded-3xl glass-panel mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 mb-2">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              Brightloop Catalog & Terms
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Products, Plans & Templates
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure subscription tiers, variant surcharges (e.g. Odoo brand +560), and reusable quote templates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowProductModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
            {user?.role === "ADMIN" && (
              <button
                onClick={() => setShowPlanModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-600/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Billing Plan
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex items-center gap-2 border-b border-emerald-500/10 pb-3">
          <button
            onClick={() => setTab("products")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              tab === "products"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-emerald-50/50"
            }`}
          >
            <Package className="w-4 h-4" />
            Products & Variants ({products.length})
          </button>
          <button
            onClick={() => setTab("plans")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              tab === "plans"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-emerald-50/50"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Billing Plans ({plans.length})
          </button>
          <button
            onClick={() => setTab("templates")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              tab === "templates"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-emerald-50/50"
            }`}
          >
            <FileText className="w-4 h-4" />
            Quotation Templates ({templates.length})
          </button>
        </div>

        {tab === "products" && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {prod.type}
                    </span>
                    <span className="text-lg font-bold text-slate-900">{formatCurrency(prod.salesPrice)}</span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{prod.name}</h3>
                  {prod.notes && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{prod.notes}</p>}

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-semibold uppercase text-slate-500 flex items-center gap-1 mb-2">
                      <Tag className="w-3 h-3 text-indigo-600" />
                      Variants ({prod.variants?.length || 0})
                    </span>
                    {prod.variants && prod.variants.length > 0 ? (
                      <div className="space-y-1.5">
                        {prod.variants.map((v: any) => (
                          <div
                            key={v.id}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <span className="text-slate-700 font-medium">{v.name}</span>
                            <span className="text-emerald-700 font-semibold">
                              +{formatCurrency(v.surcharge)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No variants configured</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                  <span>Cost: {formatCurrency(prod.costPrice)}</span>
                  <span>Margin: {formatCurrency(prod.salesPrice - prod.costPrice)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "plans" && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans.map((pl) => (
              <div
                key={pl.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {pl.frequency}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Min Qty: {pl.minQuantity}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{pl.name}</h3>
                  {pl.description && <p className="text-xs text-slate-500 mt-1">{pl.description}</p>}

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                    <div className="text-[11px] font-semibold uppercase text-slate-400 mb-1">Lifecycle Rules:</div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Auto-close when expired:</span>
                      <span className={pl.autoClose ? "text-amber-700 font-semibold" : "text-slate-400"}>
                        {pl.autoClose ? "Yes (Strict End)" : "No (Auto-Renews)"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Allow Pause:</span>
                      <span className={pl.allowPause ? "text-emerald-700" : "text-rose-600"}>
                        {pl.allowPause ? "Allowed" : "Disallowed"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Allow Early Close:</span>
                      <span className={pl.allowEarlyClose ? "text-emerald-700" : "text-rose-600"}>
                        {pl.allowEarlyClose ? "Allowed" : "Disallowed"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Allow Renewal:</span>
                      <span className={pl.allowRenew ? "text-emerald-700" : "text-rose-600"}>
                        {pl.allowRenew ? "Allowed" : "Disallowed"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                  <span>{pl._count?.subscriptions || 0} active subscriptions</span>
                  {pl.price > 0 && <span className="font-semibold text-slate-900">{formatCurrency(pl.price)} base</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "templates" && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-slate-900">{tpl.name}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                    Valid for {tpl.validityDays} days
                  </span>
                </div>
                {tpl.description && <p className="text-xs text-slate-500 mb-3">{tpl.description}</p>}
                {tpl.plan && (
                  <div className="text-xs text-slate-600 mb-3">
                    Preset Plan: <strong className="text-slate-900">{tpl.plan.name}</strong> ({tpl.plan.frequency})
                  </div>
                )}

                <div className="mt-2 pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-semibold uppercase text-slate-400 mb-2">Pre-filled Lines:</div>
                  <div className="space-y-1.5">
                    {tpl.lines.map((l: any) => (
                      <div
                        key={l.id}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-medium text-slate-900">{l.product.name}</span>
                          {l.variant && (
                            <span className="ml-1 text-[11px] text-indigo-600">({l.variant.name})</span>
                          )}
                          <span className="text-slate-500 ml-2">x{l.quantity}</span>
                        </div>
                        <span className="font-semibold text-emerald-700">
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

      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Add New Product</h3>
            <p className="text-xs text-slate-500 mb-4">Create product with optional variant pricing</p>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="e.g. Enterprise Cloud Suite"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Type</label>
                  <select
                    value={pType}
                    onChange={(e) => setPType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    <option value="SOFTWARE">Software</option>
                    <option value="SERVICE">Service</option>
                    <option value="ADDON">Add-on</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Sales Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={pSalesPrice}
                    onChange={(e) => setPSalesPrice(e.target.value)}
                    placeholder="1000.00"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Cost Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={pCostPrice}
                  onChange={(e) => setPCostPrice(e.target.value)}
                  placeholder="200.00"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Notes</label>
                <textarea
                  value={pNotes}
                  onChange={(e) => setPNotes(e.target.value)}
                  placeholder="Internal description, terms or notes"
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200">
                <div className="text-xs font-semibold text-indigo-900 mb-2">Variant / Brand Surcharge (Optional)</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Variant Name</label>
                    <input
                      type="text"
                      value={pVariantName}
                      onChange={(e) => setPVariantName(e.target.value)}
                      placeholder="e.g. Odoo Brand"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Surcharge Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={pVariantSurcharge}
                      onChange={(e) => setPVariantSurcharge(e.target.value)}
                      placeholder="e.g. 560"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Creating..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPlanModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Create Billing Plan</h3>
            <p className="text-xs text-slate-500 mb-4">Set frequency, min quantity, and lifecycle policies</p>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  value={plName}
                  onChange={(e) => setPlName(e.target.value)}
                  placeholder="e.g. Growth Monthly, Enterprise Yearly"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Billing Frequency</label>
                  <select
                    value={plFrequency}
                    onChange={(e) => setPlFrequency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Minimum Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={plMinQty}
                    onChange={(e) => setPlMinQty(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Description</label>
                <textarea
                  value={plDescription}
                  onChange={(e) => setPlDescription(e.target.value)}
                  placeholder="Brief details about the plan"
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="font-semibold text-slate-700 mb-1">Lifecycle Policies:</div>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={plAutoClose}
                    onChange={(e) => setPlAutoClose(e.target.checked)}
                    className="rounded bg-white border-slate-300 text-indigo-600 focus:ring-0"
                  />
                  <span>Close on its own when end date is reached (auto-close)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={plAllowPause}
                    onChange={(e) => setPlAllowPause(e.target.checked)}
                    className="rounded bg-white border-slate-300 text-indigo-600 focus:ring-0"
                  />
                  <span>Allow customer / staff to pause subscription</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={plAllowRenew}
                    onChange={(e) => setPlAllowRenew(e.target.checked)}
                    className="rounded bg-white border-slate-300 text-indigo-600 focus:ring-0"
                  />
                  <span>Allow subscription renewal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={plAllowEarlyClose}
                    onChange={(e) => setPlAllowEarlyClose(e.target.checked)}
                    className="rounded bg-white border-slate-300 text-indigo-600 focus:ring-0"
                  />
                  <span>Allow closing early before scheduled expiry</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition shadow-xs disabled:opacity-50 cursor-pointer"
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
