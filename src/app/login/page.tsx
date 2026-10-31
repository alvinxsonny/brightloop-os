"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Repeat, Shield, Briefcase, UserCheck, AlertCircle, ArrowRight, Lock, Mail, Sparkles } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to log in.");
      }

      const destination = redirect || data.redirectTo || "/portal";
      router.push(destination);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password@123");
  };

  return (
    <div className="min-h-screen text-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-2.5 mb-4 group cursor-pointer">
          <div className="h-10 px-2 py-1 rounded-2xl bg-white/90 border border-emerald-500/20 shadow-xs flex items-center justify-center">
            <img src="/logo.png" alt="BrightLoop OS" className="h-7 w-auto object-contain" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">BrightLoop OS</span>
        </Link>
        <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
        <p className="mt-1 text-sm text-slate-500">
          Or{" "}
          <Link href="/register" className="font-semibold text-emerald-700 hover:text-emerald-800">
            register a new customer account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        {/* Quick Login Bento Tiles */}
        <div className="mb-6 p-5 rounded-3xl glass-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              1-Click Demo Accounts
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Pre-seeded</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@brightloop.io")}
              className="p-2.5 rounded-2xl bg-white/90 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 text-left transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Shield className="w-4 h-4 text-purple-600 shrink-0" />
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900">Admin Lead</div>
                <div className="text-[10px] text-slate-500 truncate">admin@brightloop.io</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("staff@brightloop.io")}
              className="p-2.5 rounded-2xl bg-white/90 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 text-left transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Briefcase className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900">Internal Staff</div>
                <div className="text-[10px] text-slate-500 truncate">staff@brightloop.io</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("customer@acme.com")}
              className="p-2.5 rounded-2xl bg-white/90 hover:bg-teal-50/60 border border-slate-200 hover:border-teal-300 text-left transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <UserCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900">Acme Corp</div>
                <div className="text-[10px] text-slate-500 truncate">customer@acme.com</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("shop@localbakery.com")}
              className="p-2.5 rounded-2xl bg-white/90 hover:bg-teal-50/60 border border-slate-200 hover:border-teal-300 text-left transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <UserCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900">Local Bakery</div>
                <div className="text-[10px] text-slate-500 truncate">shop@localbakery.com</div>
              </div>
            </button>
          </div>
        </div>

        {/* Login Form Panel */}
        <div className="glass-panel py-8 px-6 shadow-md sm:rounded-3xl sm:px-8">
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Email Address
              </label>
              <div className="mt-1.5 relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white/90 border border-emerald-500/20 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 text-sm transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1.5 relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white/90 border border-emerald-500/20 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 text-sm transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
