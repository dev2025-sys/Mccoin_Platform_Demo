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
import { LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function UserAvatarDropdown() {
  const t = useTranslations("shared");
  const t2 = useTranslations("dashboard");
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const locale = useLocale();
  const isArabic = locale === "ar";
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.imageUrl} alt={user.fullName ?? ""} />
          <AvatarFallback>{user.fullName?.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44 mt-2 rounded-md bg-[#081935] text-white border border-[#0f294d] shadow-lg">
        <DropdownMenuItem
          onClick={() => router.push("/dashboard/profile")}
          className={`flex items-center gap-2 cursor-pointer ${
            isArabic ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <User size={16} /> {t("profile")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/verify")}
          className={`flex items-center gap-2 cursor-pointer ${
            isArabic ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <User size={16} /> {t("verify")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/dashboard/preferences")}
          className={`flex items-center gap-2 cursor-pointer ${
            isArabic ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <Settings size={16} /> {t("preferences")}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#0f294d]" />
        <DropdownMenuItem
          onClick={() => setShowLogoutPrompt(true)}
          className={`flex items-center gap-2 text-red-500 cursor-pointer ${
            isArabic ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <LogOut size={16} /> {t("logout")}
        </DropdownMenuItem>
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
