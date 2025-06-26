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

const Sidebar = () => {
  const [spotExpanded, setSpotExpanded] = useState(false);
  const { signOut } = useClerk();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

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
          My Profile
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
              ].includes(pathname)
                ? "bg-[#EC3B3B] text-white"
                : "text-[#DAE6EA] hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5" />
              Spot
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
                Assets
              </Link>
              <Link
                href="/dashboard/deposit"
                className={`block cursor-pointer py-1 px-2 rounded-md ${
                  isActive("/dashboard/deposit")
                    ? "font-bold text-white"
                    : "hover:text-white"
                }`}
              >
                Deposit
              </Link>
              <Link
                href="/dashboard/records"
                className={`block cursor-pointer py-1 px-2 rounded-md ${
                  isActive("/dashboard/records")
                    ? "font-bold text-white"
                    : "hover:text-white"
                }`}
              >
                Deposit Records
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
          Order History
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
          Preferences
        </Link>

        {/* Logout */}
        <div
          className="flex items-center gap-2 hover:text-red-500 cursor-pointer px-2"
          onClick={() => signOut()}
        >
          <LogOut className="w-5 h-5" /> Logout
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
