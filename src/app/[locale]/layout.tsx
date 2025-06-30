import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import { TradingProvider } from "@/context/TradingContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "McCoin",
  description: "McCoin Platform Staging",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const isRTL = locale === "ar";
  return (
    <ClerkProvider>
      <TradingProvider>
        <html lang={locale} dir={isRTL ? "rtl" : "ltr"}>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <NextIntlClientProvider>
              <main>{children}</main>
              <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            </NextIntlClientProvider>
          </body>
        </html>
      </TradingProvider>
    </ClerkProvider>
  );
}
