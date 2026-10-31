import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatCurrencyAmount, CurrencyCode } from "@/context/CurrencyContext";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currencyCode?: string): string {
  let code: CurrencyCode = "USD";
  if (currencyCode) {
    code = currencyCode as CurrencyCode;
  } else if (typeof window !== "undefined") {
    const saved = localStorage.getItem("brightloop_currency");
    if (saved) code = saved as CurrencyCode;
  }
  return formatCurrencyAmount(amount, code);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
