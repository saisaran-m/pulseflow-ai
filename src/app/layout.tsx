import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NetworkCanvas from "@/components/NetworkCanvas";
import AIAssistantBubble from "@/components/AIAssistantBubble";

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
  description: "PulseFlow AI monitors your serverless infrastructure in real time, using Gemini AI to diagnose crashes and alert your SRE team instantly.",
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
        {/* Interactive Network Constellation Canvas */}
        <NetworkCanvas />

        {/* Floating Ambient Glowing Blobs */}
        <div className="ambient-glow blob-1"></div>
        <div className="ambient-glow blob-2"></div>
        
        {children}

        {/* Interactive SRE Chatbot Bubble */}
        <AIAssistantBubble />
      </body>
    </html>
  );
}
