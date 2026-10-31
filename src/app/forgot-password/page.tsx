"use client";

import { useState } from "react";
import Link from "next/link";
import { Repeat, Mail, ArrowRight, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResetUrl(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process request.");
      }

      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-2.5 mb-4">
          <div className="h-10 px-2 py-1 rounded-2xl bg-white/90 border border-emerald-500/20 shadow-xs flex items-center justify-center">
            <img src="/logo.png" alt="BrightLoop OS" className="h-7 w-auto object-contain" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">BrightLoop OS</span>
        </Link>
        <h2 className="text-xl font-semibold text-slate-900">Reset your password</h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter your registered email and we&apos;ll generate a secure reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {resetUrl ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                <div className="flex items-center gap-2 font-semibold mb-1 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Password Reset Link Dispatched
                </div>
                <p className="text-xs text-emerald-700">
                  A reset link has been dispatched. You can proceed directly using the button below:
                </p>
              </div>

              <Link
                href={resetUrl}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-xs transition flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                Open Password Reset Page
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="text-center pt-2">
                <Link href="/login" className="text-xs text-indigo-600 hover:text-indigo-500 font-medium">
                  Return to sign in
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Registered Email
                </label>
                <div className="mt-1.5 relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? "Generating..." : "Send Reset Link"}
              </button>

              <div className="text-center pt-2">
                <Link href="/login" className="text-xs text-indigo-600 hover:text-indigo-500 font-medium">
                  Remember your password? Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
