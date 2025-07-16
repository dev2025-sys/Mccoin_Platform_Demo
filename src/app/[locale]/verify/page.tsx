"use client";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import KYCVerificationForm from "@/components/forms/KYCVerificationForm";

export default function VerificationPage() {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) return null;
  if (!isSignedIn) return null;

  return (
    <div className="bg-[#07153B] min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              Identity Verification
            </h1>
            <p className="text-[#DAE6EA] text-lg">
              Complete your KYC verification to access all platform features
            </p>
          </div>
          <KYCVerificationForm />
        </div>
      </div>
      <Footer />
    </div>
  );
}
