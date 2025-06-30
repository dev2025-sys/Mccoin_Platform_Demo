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
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#101C36",
                    color: "#fff",
                    borderRadius: "10px",
                    boxShadow: "0 4px 24px 0 rgba(0,0,0,0.25)",
                    padding: "16px 24px",
                    minWidth: "320px",
                    fontSize: "15px",
                    border: "1px solid #22304A",
                  },
                  success: {
                    iconTheme: {
                      primary: "#22C55E",
                      secondary: "#101C36",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "#EF4444",
                      secondary: "#101C36",
                    },
                  },
                }}
              />
            </NextIntlClientProvider>
          </body>
        </html>
      </TradingProvider>
    </ClerkProvider>
  );
}
