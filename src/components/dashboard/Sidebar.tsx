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

const Sidebar = () => {
  const t = useTranslations("dashboard");
  const [spotExpanded, setSpotExpanded] = useState(false);
  const { signOut } = useClerk();
  const pathname = usePathname();
  const locale = useLocale();

  const isActive = (path: string) => pathname === `/${locale}${path}`;

  return (
    <aside className="w-64 bg-[#081935] p-4 space-y-4 shadow-2xl">
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
              ["/dashboard/assets", "/dashboard/deposit", "/dashboard/records"]
                .map((path) => `/${locale}${path}`)
                .includes(pathname)
                ? "bg-[#EC3B3B] text-white"
                : "text-[#DAE6EA] hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5" />
              {t("sidebar.spot")}
            </div>
            {spotExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>

          {/* Subitems */}
          {spotExpanded && (
            <div className="ml-8 mt-1 space-y-1 text-[#DAE6EA] text-sm">
              <Link
                href="/dashboard/assets"
                className={`block cursor-pointer py-1 px-2 rounded-md ${
                  isActive("/dashboard/assets")
                    ? "font-bold text-white"
                    : "hover:text-white"
                }`}
              >
                {t("sidebar.assets")}
              </Link>
              <Link
                href="/dashboard/deposit"
                className={`block cursor-pointer py-1 px-2 rounded-md ${
                  isActive("/dashboard/deposit")
                    ? "font-bold text-white"
                    : "hover:text-white"
                }`}
              >
                {t("sidebar.deposit")}
              </Link>
              <Link
                href="/dashboard/records"
                className={`block cursor-pointer py-1 px-2 rounded-md ${
                  isActive("/dashboard/records")
                    ? "font-bold text-white"
                    : "hover:text-white"
                }`}
              >
                {t("sidebar.records")}
              </Link>
            </div>
          )}
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
          onClick={() => signOut()}
        >
          <LogOut className="w-5 h-5" /> {t("sidebar.logout")}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
