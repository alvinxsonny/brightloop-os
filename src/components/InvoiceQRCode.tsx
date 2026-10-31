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
    <div className={`rounded-2xl border border-emerald-500/20 bg-emerald-50/40 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 leading-tight">
              Instant Payment QR Code
            </h4>
            <p className="text-[10px] text-slate-500">
              UPI, SEPA & Wire Remittance Quick-Scan
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="print:hidden text-[11px] font-medium text-emerald-800 hover:text-emerald-950 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-emerald-100/60 transition cursor-pointer"
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
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
          {/* Crisp Scalable Vector QR */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs flex-shrink-0">
            <svg
              width={svgSize}
              height={svgSize}
              viewBox={`0 0 ${svgSize} ${svgSize}`}
              className="w-28 h-28 sm:w-32 sm:h-32"
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

          <div className="space-y-1.5 text-xs text-slate-600 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">Invoice Ref:</span>
              <span className="font-mono font-bold text-slate-900">{invoiceNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">Amount Due:</span>
              <span className="font-mono font-bold text-emerald-700">{formattedAmount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">Routing:</span>
              <span className="font-mono text-slate-700">121000358 (SVB)</span>
            </div>

            <div className="pt-2 print:hidden flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold hover:bg-slate-50 transition shadow-2xs cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Copied Remittance</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-500" />
                    <span>Copy Remittance URI</span>
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
