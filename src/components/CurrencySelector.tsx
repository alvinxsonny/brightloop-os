"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCurrency, CurrencyCode } from "@/context/CurrencyContext";
import { Coins, Check, ChevronDown } from "lucide-react";

interface CurrencySelectorProps {
  compact?: boolean;
  className?: string;
}

export default function CurrencySelector({ compact = false, className = "" }: CurrencySelectorProps) {
  const { currency, setCurrency, currencies } = useCurrency();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeCurrency = currencies.find((c) => c.code === currency) || currencies[0];

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:border-emerald-500/40 hover:bg-emerald-50/50 hover:text-emerald-800 transition cursor-pointer backdrop-blur-sm ${
          compact ? "p-1.5 justify-center" : ""
        }`}
        title={`Change currency (current: ${activeCurrency.name})`}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px]">
          {activeCurrency.symbol}
        </span>
        {!compact && (
          <>
            <span className="font-semibold text-slate-800">{activeCurrency.code}</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
          </>
        )}
      </button>

      {open && (
        <div className="absolute left-0 mt-2 z-50 w-44 rounded-2xl border border-emerald-500/20 bg-white/95 p-1.5 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Select Currency
          </div>
          <div className="space-y-0.5">
            {currencies.map((c) => (
              <button
                key={c.code}
                onClick={() => {
                  setCurrency(c.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  currency === c.code
                    ? "bg-emerald-50 text-emerald-800 font-bold"
                    : "text-slate-700 hover:bg-emerald-50/50 hover:text-emerald-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 font-mono text-[11px] text-slate-700">
                    {c.symbol}
                  </span>
                  <span>{c.code}</span>
                </div>
                {currency === c.code && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

