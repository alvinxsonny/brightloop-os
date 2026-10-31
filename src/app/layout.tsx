import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import JudgeDemoWalkthrough from "@/components/JudgeDemoWalkthrough";

export const metadata: Metadata = {
  title: "BrightLoop OS — Autonomous Subscription & Billing Platform",
  description: "Next-gen subscription lifecycle, recurring billing engine & financial control for Brightloop Software.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
        <ToastProvider>
          {children}
          <JudgeDemoWalkthrough />
        </ToastProvider>
      </body>
    </html>
  );
}
