import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "XperaOne — Premium Digital Marketplace",
    template: "%s · XperaOne",
  },
  description:
    "XperaOne is a premium digital marketplace for UI kits, website templates, eBooks, fonts, and creative assets.",
  openGraph: {
    title: "XperaOne — Premium Digital Marketplace",
    description: "Discover premium UI kits, templates, eBooks, and digital assets on XperaOne.",
    siteName: "XperaOne",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f7f6fb] text-slate-900 antialiased">{children}</body>
    </html>
  );
}
