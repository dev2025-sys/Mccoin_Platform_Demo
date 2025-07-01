"use client";
import SumsubIframeVerification from "@/components/custom/SumsubVerification";
import Navbar from "@/components/shared/Navbar";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
      <h1 className="text-2xl text-white text-center my-4">Verify Identity</h1>
      <SumsubIframeVerification levelName="basic-kyc-level" />
    </div>
  );
}
