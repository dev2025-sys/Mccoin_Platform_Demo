"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/shared/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07153B] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC3B3B] mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not signed in (will redirect)
  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#07153B] text-white">
      <Navbar />
      <div className="flex lg:flex-row flex-col">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
