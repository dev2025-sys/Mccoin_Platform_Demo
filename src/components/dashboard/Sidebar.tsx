"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  History,
  User,
  LogOut,
  Cog,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const t = useTranslations("dashboard");
  const [spotExpanded, setSpotExpanded] = useState(false);
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);
  const { signOut } = useClerk();
  const pathname = usePathname() || "/";
  const locale = useLocale();

  const isActive = (path: string) => pathname === `/${locale}${path}`;

  return (
    <aside className="w-full lg:w-64 bg-[#081935] p-4 space-y-4 shadow-2xl">
      <nav className="space-y-2">
        {/* My Profile */}
        <Link
          href="/dashboard/profile"
          className={`flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer ${
            isActive("/dashboard/profile")
              ? "bg-[#EC3B3B] text-white"
              : "text-[#DAE6EA] hover:text-white"
          }`}
        >
          <User className="w-5 h-5" />
          {t("sidebar.profile")}
        </Link>

        {/* Spot with Submenu */}
        <div>
          <div
            onClick={() => setSpotExpanded(!spotExpanded)}
            className={`flex items-center justify-between px-2 py-2 rounded-md cursor-pointer ${
              [
                "/dashboard/assets",
                "/dashboard/deposit",
                "/dashboard/records",
                "/dashboard/withdraw",
                "/dashboard/withdraw-records",
              ]
                .map((path) => `/${locale}${path}`)
                .includes(pathname)
                ? "bg-[#EC3B3B] text-white"
                : "text-[#DAE6EA] hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5" />
              {t("sidebar.my_wallet")}
            </div>
            <motion.div
              animate={{ rotate: spotExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </div>

          {/* Subitems */}
          <AnimatePresence>
            {spotExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="ml-8 mt-1 space-y-1 text-[#DAE6EA] text-sm"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    <Link
                      href="/dashboard/assets"
                      className={`block cursor-pointer py-1 px-2 rounded-md transition-colors duration-200 ${
                        isActive("/dashboard/assets")
                          ? "font-bold text-white"
                          : "hover:text-white hover:bg-[#0f294d]"
                      }`}
                    >
                      {t("sidebar.assets")}
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Link
                      href="/dashboard/deposit"
                      className={`block cursor-pointer py-1 px-2 rounded-md transition-colors duration-200 ${
                        isActive("/dashboard/deposit")
                          ? "font-bold text-white"
                          : "hover:text-white hover:bg-[#0f294d]"
                      }`}
                    >
                      {t("sidebar.deposit")}
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    <Link
                      href="/dashboard/records"
                      className={`block cursor-pointer py-1 px-2 rounded-md transition-colors duration-200 ${
                        isActive("/dashboard/records")
                          ? "font-bold text-white"
                          : "hover:text-white hover:bg-[#0f294d]"
                      }`}
                    >
                      {t("sidebar.records")}
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link
                      href="/dashboard/withdraw"
                      className={`block cursor-pointer py-1 px-2 rounded-md transition-colors duration-200 ${
                        isActive("/dashboard/withdraw")
                          ? "font-bold text-white"
                          : "hover:text-white hover:bg-[#0f294d]"
                      }`}
                    >
                      {t("sidebar.withdraw")}
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                  >
                    <Link
                      href="/dashboard/withdraw-records"
                      className={`block cursor-pointer py-1 px-2 rounded-md transition-colors duration-200 ${
                        isActive("/dashboard/withdraw-records")
                          ? "font-bold text-white"
                          : "hover:text-white hover:bg-[#0f294d]"
                      }`}
                    >
                      {t("sidebar.withdraw-records")}
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order History */}
        <Link
          href="/dashboard/order-history"
          className={`flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer ${
            isActive("/dashboard/order-history")
              ? "bg-[#EC3B3B] text-white"
              : "text-[#DAE6EA] hover:text-white"
          }`}
        >
          <History className="w-5 h-5" />
          {t("sidebar.orderHistory")}
        </Link>

        {/* Preferences */}
        <Link
          href="/dashboard/preferences"
          className={`flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer ${
            isActive("/dashboard/preferences")
              ? "bg-[#EC3B3B] text-white"
              : "text-[#DAE6EA] hover:text-white"
          }`}
        >
          <Cog className="w-5 h-5" />
          {t("sidebar.preferences")}
        </Link>

        {/* Logout */}
        <div
          className="flex items-center gap-2 hover:text-red-500 cursor-pointer px-2"
          onClick={() => setShowLogoutPrompt(true)}
        >
          <LogOut className="w-5 h-5" /> {t("sidebar.logout")}
        </div>
      </nav>
      {/* Logout Confirmation Modal */}
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
                {t("logoutPrompt")}
              </div>
              <div className="flex justify-center gap-4 mt-6">
                <button
                  className="px-6 py-2 rounded-md bg-[#EC3B3B] text-white font-medium hover:bg-[#D13535] transition-colors"
                  onClick={() => {
                    setShowLogoutPrompt(false);
                    setTimeout(() => signOut(), 300); // allow animation to finish
                  }}
                >
                  {t("yes")}
                </button>
                <button
                  className="px-6 py-2 rounded-md bg-[#22304A] text-white font-medium hover:bg-[#1a2536] transition-colors"
                  onClick={() => setShowLogoutPrompt(false)}
                >
                  {t("no")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};

export default Sidebar;
