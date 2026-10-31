import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import { CurrencyProvider } from "@/context/CurrencyContext";
import JudgeDemoWalkthrough from "@/components/JudgeDemoWalkthrough";

export const metadata: Metadata = {
  title: "BrightLoop OS — Subscription & Recurring Billing Platform",
  description: "Subscription lifecycle, recurring billing engine & financial control for Brightloop Software.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#fbfcfb] bg-graph-grid text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 relative overflow-x-hidden">
        {/* Subtle Ambient Background Gradient Lighting */}
        <div className="fixed -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-emerald-200/15 blur-[140px] pointer-events-none -z-10" />
        <div className="fixed -bottom-36 -right-36 w-[550px] h-[550px] rounded-full bg-teal-100/20 blur-[150px] pointer-events-none -z-10" />

        <CurrencyProvider>
          <ToastProvider>
            {children}
            <JudgeDemoWalkthrough />
          </ToastProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
