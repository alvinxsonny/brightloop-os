"use client";

import React, { useMemo, useState } from "react";
import { generateQRCodeMatrix } from "@/lib/qr";
import { QrCode, Check, Copy, Eye, EyeOff } from "lucide-react";

interface InvoiceQRCodeProps {
  invoiceNumber: string;
  amount: number;
  formattedAmount: string;
  currencyCode?: string;
  className?: string;
}

export default function InvoiceQRCode({
  invoiceNumber,
  amount,
  formattedAmount,
  currencyCode = "USD",
  className = "",
}: InvoiceQRCodeProps) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(true);

  // Generate payment remittance URI
  const paymentPayload = useMemo(() => {
    return `brightloop://pay?inv=${encodeURIComponent(
      invoiceNumber
    )}&amount=${amount}&currency=${currencyCode}&account=9812-4410-09`;
  }, [invoiceNumber, amount, currencyCode]);

  // Generate 2D QR matrix
  const matrix = useMemo(() => {
    try {
      return generateQRCodeMatrix(paymentPayload);
    } catch {
      // Fallback simple payload
      return generateQRCodeMatrix(`INV:${invoiceNumber}`);
    }
  }, [paymentPayload, invoiceNumber]);

  const matrixSize = matrix.length;
  const cellSize = 6;
  const padding = 12;
  const svgSize = matrixSize * cellSize + padding * 2;

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 shadow-xs print:border-slate-300 print:bg-white print:shadow-none print:break-inside-avoid ${className}`}>
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 leading-tight">
              Instant Payment QR Code
            </h4>
            <p className="text-[10px] text-slate-500">
              Scan with mobile banking or remittance app
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="print:hidden text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-emerald-100/60 transition cursor-pointer"
          title={visible ? "Hide QR Code" : "Show QR Code"}
        >
          {visible ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hide</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Show QR</span>
            </>
          )}
        </button>
      </div>

      {visible && (
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pt-1">
          {/* Crisp Scalable Vector QR */}
          <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-xs shrink-0">
            <svg
              width={svgSize}
              height={svgSize}
              viewBox={`0 0 ${svgSize} ${svgSize}`}
              className="w-28 h-28"
              shapeRendering="crispEdges"
            >
              <rect width={svgSize} height={svgSize} fill="#ffffff" />
              {matrix.map((row, r) =>
                row.map((isDark, c) => {
                  if (!isDark) return null;
                  return (
                    <rect
                      key={`${r}-${c}`}
                      x={padding + c * cellSize}
                      y={padding + r * cellSize}
                      width={cellSize}
                      height={cellSize}
                      fill="#0f172a"
                    />
                  );
                })
              )}
            </svg>
          </div>

          <div className="space-y-2 text-xs text-slate-600 flex-1 w-full min-w-0">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500 text-[11px] shrink-0">Invoice Ref:</span>
              <span className="font-mono font-bold text-slate-900 truncate">{invoiceNumber}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500 text-[11px] shrink-0">Amount Due:</span>
              <span className="font-mono font-bold text-emerald-700 tabular-nums whitespace-nowrap">{formattedAmount}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500 text-[11px] shrink-0">Routing:</span>
              <span className="font-mono text-slate-700">121000358 (SVB)</span>
            </div>

            <div className="pt-2 print:hidden">
              <button
                type="button"
                onClick={handleCopy}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold transition shadow-xs cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied Remittance Link</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Remittance String</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

