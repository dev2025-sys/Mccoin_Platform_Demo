"use client";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#07153B] text-white">
      <Navbar />
      <main className="mx-auto xl:max-w-[70%] xl:px-0 px-4">{children}</main>
      <Footer />
    </div>
  );
}
