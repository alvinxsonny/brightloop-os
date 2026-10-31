import React from "react";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  PauseCircle,
  XCircle,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export type StatusType =
  | "DRAFT"
  | "QUOTATION"
  | "CONFIRMED"
  | "ACTIVE"
  | "PAUSED"
  | "CLOSED"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

interface StatusBadgeProps {
  status: string;
  isOverdue?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export default function StatusBadge({
  status,
  isOverdue = false,
  className = "",
  size = "md",
}: StatusBadgeProps) {
  const norm = (status || "").toUpperCase();

  // Overdue overrides other statuses for invoices
  if (isOverdue && norm !== "PAID" && norm !== "CANCELLED") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm animate-pulse ${
          size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
        } ${className}`}
      >
        <AlertTriangle className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
        Overdue
      </span>
    );
  }

  switch (norm) {
    case "ACTIVE":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 ${
            size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
          } ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          Active
        </span>
      );

    case "PAID":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 ${
            size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
          } ${className}`}
        >
          <CheckCircle2 className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
          Paid
        </span>
      );

    case "CONFIRMED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 ${
            size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
          } ${className}`}
        >
          <Clock className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
          Confirmed
        </span>
      );

    case "QUOTATION":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 ${
            size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
          } ${className}`}
        >
          <FileText className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
          Quotation
        </span>
      );

    case "PAUSED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 ${
            size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
          } ${className}`}
        >
          <PauseCircle className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
          Paused
        </span>
      );

    case "DRAFT":
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-slate-700/40 text-slate-300 border border-slate-600/40 ${
            size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
          } ${className}`}
        >
          Draft
        </span>
      );

    case "CLOSED":
    case "CANCELLED":
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-zinc-800/60 text-zinc-400 border border-zinc-700/40 ${
            size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
          } ${className}`}
        >
          <XCircle className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
          {norm === "CLOSED" ? "Closed" : "Cancelled"}
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700 ${
            size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
          } ${className}`}
        >
          {status}
        </span>
      );
  }
}
