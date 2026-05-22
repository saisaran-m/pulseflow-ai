import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PulseFlow AI | SRE Observability & Diagnostics Hub",
  description: "Enterprise SaaS DevOps Telemetry & API Observability Hub powered by context-aware Gemini AI diagnostics and real-time P95 trace metrics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative" style={{ overflowX: 'hidden' }}>
        {/* Floating Ambient Glowing Blobs */}
        <div className="ambient-glow blob-1"></div>
        <div className="ambient-glow blob-2"></div>
        {children}
      </body>
    </html>
  );
}
