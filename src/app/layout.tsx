import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}

