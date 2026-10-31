import React from "react";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  PauseCircle,
  XCircle,
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

  if (isOverdue && norm !== "PAID" && norm !== "CANCELLED") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${
          size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
        } ${className}`}
      >
        <AlertTriangle className={size === "sm" ? "w-3 h-3 text-rose-600" : "w-3.5 h-3.5 text-rose-600"} />
        Overdue
      </span>
    );
  }

  switch (norm) {
    case "ACTIVE":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${
            size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
          } ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          Active
        </span>
      );

    case "PAID":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${
            size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
          } ${className}`}
        >
          <CheckCircle2 className={size === "sm" ? "w-3 h-3 text-emerald-600" : "w-3.5 h-3.5 text-emerald-600"} />
          Paid
        </span>
      );

    case "CONFIRMED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 ${
            size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
          } ${className}`}
        >
          <Clock className={size === "sm" ? "w-3 h-3 text-indigo-600" : "w-3.5 h-3.5 text-indigo-600"} />
          Confirmed
        </span>
      );

    case "QUOTATION":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-sky-50 text-sky-700 border border-sky-200 ${
            size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
          } ${className}`}
        >
          <FileText className={size === "sm" ? "w-3 h-3 text-sky-600" : "w-3.5 h-3.5 text-sky-600"} />
          Quotation
        </span>
      );

    case "PAUSED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${
            size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
          } ${className}`}
        >
          <PauseCircle className={size === "sm" ? "w-3 h-3 text-amber-600" : "w-3.5 h-3.5 text-amber-600"} />
          Paused
        </span>
      );

    case "DRAFT":
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${
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
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${
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
          className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${
            size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
          } ${className}`}
        >
          {status}
        </span>
      );
  }
}
