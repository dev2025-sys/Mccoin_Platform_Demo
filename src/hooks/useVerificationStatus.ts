"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

export function useVerificationStatus() {
  const { user, isLoaded } = useUser();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) {
      setIsVerified(null);
      setIsLoading(false);
      return;
    }

    const checkVerificationStatus = async () => {
      try {
        const response = await fetch("/api/user/kyc-status");
        const data = await response.json();
        setIsVerified(data.verified);
      } catch (error) {
        console.error("Error checking verification status:", error);
        setIsVerified(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkVerificationStatus();
  }, [isLoaded, user]);

  return { isVerified, isLoading };
}
