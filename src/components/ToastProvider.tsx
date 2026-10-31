"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Standalone global trigger using custom window events
export function showToast(type: ToastType, message: string, title?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("brightloop-toast", {
        detail: { type, message, title },
      })
    );
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, title?: string, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, message, title, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]); // Keep at most 5

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  // Listen for global custom events
  useEffect(() => {
    const handleCustomToast = (event: Event) => {
      const customEvent = event as CustomEvent<{
        type: ToastType;
        message: string;
        title?: string;
      }>;
      if (customEvent.detail) {
        addToast(customEvent.detail.type, customEvent.detail.message, customEvent.detail.title);
      }
    };

    window.addEventListener("brightloop-toast", handleCustomToast);
    return () => window.removeEventListener("brightloop-toast", handleCustomToast);
  }, [addToast]);

  const toastMethods = {
    success: (message: string, title?: string) => addToast("success", message, title),
    error: (message: string, title?: string) => addToast("error", message, title),
    info: (message: string, title?: string) => addToast("info", message, title),
  };

  return (
    <ToastContext.Provider value={{ toast: toastMethods }}>
      {children}

      {/* Floating Toast Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0">
        {toasts.map((t) => {
          const isSuccess = t.type === "success";
          const isError = t.type === "error";

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${
                isSuccess
                  ? "bg-white border-emerald-200 text-slate-800"
                  : isError
                  ? "bg-white border-rose-200 text-slate-800"
                  : "bg-white border-indigo-200 text-slate-800"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {isError && <AlertCircle className="w-4 h-4 text-rose-600" />}
                {!isSuccess && !isError && <Info className="w-4 h-4 text-indigo-600" />}
              </div>

              <div className="flex-1 min-w-0">
                {t.title && <div className="text-xs font-semibold text-slate-900 mb-0.5">{t.title}</div>}
                <div className="text-xs text-slate-600 leading-snug break-words">{t.message}</div>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback using window event if called outside provider
    return {
      toast: {
        success: (msg: string, title?: string) => showToast("success", msg, title),
        error: (msg: string, title?: string) => showToast("error", msg, title),
        info: (msg: string, title?: string) => showToast("info", msg, title),
      },
    };
  }
  return context;
}
