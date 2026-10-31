"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "INR" | "JPY" | "CAD" | "AUD";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate: number;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: "USD", symbol: "$", name: "US Dollar (USD)", rate: 1.0, locale: "en-US" },
  EUR: { code: "EUR", symbol: "€", name: "Euro (EUR)", rate: 0.92, locale: "de-DE" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound (GBP)", rate: 0.79, locale: "en-GB" },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee (INR)", rate: 84.0, locale: "en-IN" },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen (JPY)", rate: 155.0, locale: "ja-JP" },
  CAD: { code: "CAD", symbol: "CA$", name: "Canadian Dollar (CAD)", rate: 1.38, locale: "en-CA" },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar (AUD)", rate: 1.52, locale: "en-AU" },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatCurrency: (amountInUSD: number) => string;
  config: CurrencyConfig;
  currencies: CurrencyConfig[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function formatCurrencyAmount(amountInUSD: number, code: CurrencyCode = "USD"): string {
  const config = CURRENCIES[code] || CURRENCIES.USD;
  const converted = (amountInUSD || 0) * config.rate;
  const fractionDigits = code === "JPY" ? 0 : 2;

  try {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(converted);
  } catch {
    return `${config.symbol}${converted.toFixed(fractionDigits)}`;
  }
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("brightloop_currency") as CurrencyCode;
      if (saved && CURRENCIES[saved]) {
        setCurrencyState(saved);
      }
    }
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    if (CURRENCIES[code]) {
      setCurrencyState(code);
      if (typeof window !== "undefined") {
        localStorage.setItem("brightloop_currency", code);
        window.dispatchEvent(new CustomEvent("currency-changed", { detail: { code } }));
      }
    }
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "brightloop_currency" && e.newValue && CURRENCIES[e.newValue as CurrencyCode]) {
        setCurrencyState(e.newValue as CurrencyCode);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const formatCurrency = useCallback(
    (amountInUSD: number) => {
      return formatCurrencyAmount(amountInUSD, currency);
    },
    [currency]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatCurrency,
        config: CURRENCIES[currency],
        currencies: Object.values(CURRENCIES),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: "USD" as CurrencyCode,
      setCurrency: () => {},
      formatCurrency: (amount: number) => formatCurrencyAmount(amount, "USD"),
      config: CURRENCIES.USD,
      currencies: Object.values(CURRENCIES),
    };
  }
  return context;
}

