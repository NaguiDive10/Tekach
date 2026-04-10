import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FirebaseNotice } from "@/components/FirebaseNotice";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tekach — Plateforme de relance e-commerce",
  description:
    "SDK d’ingestion, dashboard multi-tenant et boutique démo — relances email / voix et automations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            <FirebaseNotice />
            <SiteHeader />
            <main className="mx-auto min-h-[calc(100vh-8rem)] max-w-[1500px] px-3 py-8 sm:px-4 md:py-10">
              {children}
            </main>
            <SiteFooter />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
