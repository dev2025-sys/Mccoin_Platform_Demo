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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        signIn: {
          baseTheme: undefined,
        },
        signUp: {
          baseTheme: undefined,
        },
      }}
    >
      <TradingProvider>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <main>{children}</main>
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          </body>
        </html>
      </TradingProvider>
    </ClerkProvider>
  );
}
