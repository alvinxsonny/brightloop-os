import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
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
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
        <ToastProvider>
          {children}
          <JudgeDemoWalkthrough />
        </ToastProvider>
      </body>
    </html>
  );
}
