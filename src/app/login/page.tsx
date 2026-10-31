"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Repeat, Shield, Briefcase, UserCheck, AlertCircle, ArrowRight, Lock, Mail } from "lucide-react";

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Repeat className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">BrightLoop OS</span>
        </Link>
        <h2 className="text-xl font-semibold text-slate-200">Sign in to your account</h2>
        <p className="mt-1 text-sm text-slate-400">
          Or{" "}
          <Link href="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
            register a new customer account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Quick Demo Switcher for Judges */}
        <div className="mb-6 p-4 rounded-xl bg-slate-900/80 border border-indigo-500/30 shadow-lg shadow-indigo-950/40">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              ⚡ Hackathon Quick Login
            </span>
            <span className="text-[11px] text-slate-400">Pre-seeded accounts</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@brightloop.io")}
              className="px-2.5 py-2 rounded-lg bg-slate-800/80 hover:bg-purple-950/50 hover:border-purple-500/50 border border-slate-700/60 text-left transition flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <div className="truncate">
                <div className="text-xs font-medium text-white">Admin Lead</div>
                <div className="text-[10px] text-slate-400 truncate">admin@brightloop.io</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("staff@brightloop.io")}
              className="px-2.5 py-2 rounded-lg bg-slate-800/80 hover:bg-blue-950/50 hover:border-blue-500/50 border border-slate-700/60 text-left transition flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <div className="truncate">
                <div className="text-xs font-medium text-white">Internal Staff</div>
                <div className="text-[10px] text-slate-400 truncate">staff@brightloop.io</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("customer@acme.com")}
              className="px-2.5 py-2 rounded-lg bg-slate-800/80 hover:bg-emerald-950/50 hover:border-emerald-500/50 border border-slate-700/60 text-left transition flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div className="truncate">
                <div className="text-xs font-medium text-white">Acme Corp</div>
                <div className="text-[10px] text-slate-400 truncate">customer@acme.com</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("shop@localbakery.com")}
              className="px-2.5 py-2 rounded-lg bg-slate-800/80 hover:bg-emerald-950/50 hover:border-emerald-500/50 border border-slate-700/60 text-left transition flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div className="truncate">
                <div className="text-xs font-medium text-white">Local Bakery</div>
                <div className="text-[10px] text-slate-400 truncate">shop@localbakery.com</div>
              </div>
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 py-8 px-6 shadow-xl border border-slate-800 sm:rounded-2xl sm:px-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Email Address
              </label>
              <div className="mt-1.5 relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1.5 relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-60"
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
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
