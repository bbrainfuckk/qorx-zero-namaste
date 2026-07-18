import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Qorx Zero — Memory that stays with the work",
  description:
    "Keep project memory on your device and send only a compact proof frame for the current task.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Qorx Zero",
    description: "Memory that stays with the work.",
    images: ["/og-card.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
