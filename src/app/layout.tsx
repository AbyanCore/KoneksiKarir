import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/navbar";
import TRPCProvider from "@/components/trpc/trpc-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KoneksiKarir",
  description:
    "KoneksiKarir is a platform that helps people discover and connect with career opportunities.",
  keywords: [
    "KoneksiKarir",
    "Job Portal",
    "Lowongan Kerja",
    "Cari Kerja",
    "Job Search",
    "Career Opportunities",
    "Employment",
    "Hiring",
    "Recruitment",
    "Job Listings",
    "Career Development",
    "Professional Networking",
    "Find Jobs Online",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <NavBar />
          <TRPCProvider>{children}</TRPCProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
