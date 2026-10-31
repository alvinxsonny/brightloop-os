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
        {/* Heavily Blurred Background Gradient Floating Circles */}
        <div className="fixed -top-40 -left-40 w-[550px] h-[550px] rounded-full bg-emerald-300/25 blur-[130px] pointer-events-none -z-10 animate-float-slow" />
        <div className="fixed -bottom-48 -right-48 w-[650px] h-[650px] rounded-full bg-teal-300/20 blur-[150px] pointer-events-none -z-10 animate-float-reverse" />
        <div className="fixed top-1/3 -right-20 w-[450px] h-[450px] rounded-full bg-green-200/30 blur-[120px] pointer-events-none -z-10" />
        <div className="fixed bottom-1/4 left-1/4 w-[380px] h-[380px] rounded-full bg-emerald-100/40 blur-[100px] pointer-events-none -z-10" />

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
