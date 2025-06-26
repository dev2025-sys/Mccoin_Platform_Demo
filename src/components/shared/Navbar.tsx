"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import AnimatedLogo from "../custom/AnimatedLogoDark";
import UserAvatarDropdown from "./UserAvatarDropdown";

const Navbar = () => {
  const { user, isLoaded } = useUser();

  // Don't render navbar if user is not loaded or not authenticated
  if (!isLoaded || !user) {
    return null;
  }

  return (
    <nav className="mx-auto h-16 xl:max-w-[70%] bg-[#07153B] text-white px-6 flex items-center justify-between shadow-lg">
      <Link href="/" className="flex items-center gap-2">
        <AnimatedLogo />
      </Link>

      <div className="hidden md:flex gap-10 text-sm tracking-wide text-[#DAE6EA]">
        <Link href="/market-overview" className="hover:text-white transition">
          Market
        </Link>
        <Link href="/spot" className="hover:text-white transition">
          Spot
        </Link>
        <Link href="/about" className="hover:text-white transition">
          About
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <UserAvatarDropdown />

        <Button
          variant="ghost"
          className="text-[#DAE6EA] flex items-center gap-1 px-2 hover:text-white"
        >
          Eng <ChevronDown size={14} />
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
