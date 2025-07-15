// components/layout/UserAvatarDropdown.tsx
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser, useClerk } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LogOut, Settings, User, LogIn, UserPlus, Power } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { HiMiniArrowRightStartOnRectangle } from "react-icons/hi2";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import VerificationBadge from "./VerificationBadge";
export default function UserAvatarDropdown() {
  const t = useTranslations("shared");
  const t2 = useTranslations("dashboard");
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const locale = useLocale();
  const isArabic = locale === "ar";
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);
  const { isVerified, isLoading: isVerificationLoading } =
    useVerificationStatus();

  // Debug function to manually check verification status
  const debugCheckVerification = async () => {
    try {
      const response = await fetch("/api/user/kyc-status");
      const data = await response.json();
      console.log("Manual verification check:", data);
    } catch (error) {
      console.error("Manual verification check error:", error);
    }
  };

  // Test functions for manual verification testing
  const testVerify = async () => {
    try {
      const response = await fetch("/api/test-kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify" }),
      });
      const data = await response.json();
      console.log("Test verify result:", data);
      // Force refresh
      window.location.reload();
    } catch (error) {
      console.error("Test verify error:", error);
    }
  };

  const testUnverify = async () => {
    try {
      const response = await fetch("/api/test-kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unverify" }),
      });
      const data = await response.json();
      console.log("Test unverify result:", data);
      // Force refresh
      window.location.reload();
    } catch (error) {
      console.error("Test unverify error:", error);
    }
  };

  const debugUserMetadata = async () => {
    try {
      const response = await fetch("/api/debug-user");
      const data = await response.json();
      console.log("User metadata debug:", data);
    } catch (error) {
      console.error("Debug user metadata error:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none">
        <div className="relative">
          <Avatar className="h-8 w-8 cursor-pointer">
            {isLoaded && user ? (
              <>
                <AvatarImage src={user.imageUrl} alt={user.fullName ?? ""} />
                <AvatarFallback>{user.fullName?.charAt(0)}</AvatarFallback>
              </>
            ) : (
              <Power size={24} className="mt-1 text-white" />
            )}
          </Avatar>
          {isLoaded && user && !isVerificationLoading && (
            <VerificationBadge isVerified={isVerified || false} size="sm" />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44 mt-2 rounded-md bg-[#081935] text-white border border-[#0f294d] shadow-lg">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {isLoaded && user ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/profile")}
                  className={`flex items-center gap-2 cursor-pointer hover:bg-[#0f294d] transition-colors duration-200 ${
                    isArabic ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <User size={16} /> {t("profile")}
                </DropdownMenuItem>
              </motion.div>

              {!isVerified && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <DropdownMenuItem
                    onClick={() => router.push("/verify")}
                    className={`flex items-center gap-2 cursor-pointer hover:bg-[#0f294d] transition-colors duration-200 ${
                      isArabic ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <User size={16} /> {t("verify")}
                  </DropdownMenuItem>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/preferences")}
                  className={`flex items-center gap-2 cursor-pointer hover:bg-[#0f294d] transition-colors duration-200 ${
                    isArabic ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Settings size={16} /> {t("preferences")}
                </DropdownMenuItem>
              </motion.div>

              <DropdownMenuSeparator className="bg-[#0f294d]" />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <DropdownMenuItem
                  onClick={() => setShowLogoutPrompt(true)}
                  className={`flex items-center gap-2 text-red-500 cursor-pointer hover:bg-[#0f294d] transition-colors duration-200 ${
                    isArabic ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <LogOut size={16} /> {t("logout")}
                </DropdownMenuItem>
              </motion.div>

              {/* Debug buttons - remove in production */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <DropdownMenuItem
                  onClick={debugCheckVerification}
                  className={`flex items-center gap-2 text-blue-400 cursor-pointer hover:bg-[#0f294d] transition-colors duration-200 ${
                    isArabic ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Settings size={16} /> Debug KYC
                </DropdownMenuItem>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                <DropdownMenuItem
                  onClick={testVerify}
                  className={`flex items-center gap-2 text-green-400 cursor-pointer hover:bg-[#0f294d] transition-colors duration-200 ${
                    isArabic ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Settings size={16} /> Test Verify
                </DropdownMenuItem>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <DropdownMenuItem
                  onClick={testUnverify}
                  className={`flex items-center gap-2 text-yellow-400 cursor-pointer hover:bg-[#0f294d] transition-colors duration-200 ${
                    isArabic ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Settings size={16} /> Test Unverify
                </DropdownMenuItem>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                <DropdownMenuItem
                  onClick={debugUserMetadata}
                  className={`flex items-center gap-2 text-purple-400 cursor-pointer hover:bg-[#0f294d] transition-colors duration-200 ${
                    isArabic ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Settings size={16} /> Debug Metadata
                </DropdownMenuItem>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <DropdownMenuItem
                  onClick={() => router.push("/sign-in")}
                  className={`flex items-center gap-2 cursor-pointer hover:bg-[#0f294d] transition-colors duration-200 ${
                    isArabic ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <LogIn size={16} /> {t("login")}
                </DropdownMenuItem>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <DropdownMenuItem
                  onClick={() => router.push("/sign-up")}
                  className={`flex items-center gap-2 cursor-pointer hover:bg-[#0f294d] transition-colors duration-200 ${
                    isArabic ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <UserPlus size={16} /> {t("register")}
                </DropdownMenuItem>
              </motion.div>
            </>
          )}
        </motion.div>
      </DropdownMenuContent>
      <AnimatePresence>
        {showLogoutPrompt && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#101C36] rounded-xl shadow-2xl p-8 w-full max-w-sm text-center relative"
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <div className="text-lg font-semibold mb-4 text-white">
                {t2("logoutPrompt")}
              </div>
              <div className="flex justify-center gap-4 mt-6">
                <button
                  className="px-6 py-2 rounded-md bg-[#EC3B3B] text-white font-medium hover:bg-[#D13535] transition-colors"
                  onClick={() => {
                    setShowLogoutPrompt(false);
                    setTimeout(() => signOut(), 300);
                  }}
                >
                  {t2("yes")}
                </button>
                <button
                  className="px-6 py-2 rounded-md bg-[#22304A] text-white font-medium hover:bg-[#1a2536] transition-colors"
                  onClick={() => setShowLogoutPrompt(false)}
                >
                  {t2("no")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DropdownMenu>
  );
}
