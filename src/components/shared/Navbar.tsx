"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import AnimatedLogo from "../custom/AnimatedLogoDark";
import UserAvatarDropdown from "./UserAvatarDropdown";
import LanguageDropdown from "./LanguageDropdown";
import NavLink from "./NavLink";
import { useTranslations } from "next-intl";

const Navbar = () => {
  const t = useTranslations("navbar");
  const { user, isLoaded } = useUser();
  const pathname = usePathname();

  return (
    <nav className="mx-auto h-16 xl:max-w-[70%] bg-[#07153B] text-white px-6 flex items-center justify-between shadow-lg">
      <Link href="/" className="flex items-center gap-2">
        <AnimatedLogo />
      </Link>

      <div className="hidden md:flex gap-10 text-sm tracking-wide text-[#DAE6EA]">
        <NavLink href="/market-overview" label={t("market")} />
        {isLoaded && user && <NavLink href="/spot" label={t("spot")} />}
        <NavLink href="/news" label={t("news")} />
      </div>

      <div className="flex items-center gap-4">
        <UserAvatarDropdown />
        <LanguageDropdown />
      </div>
    </nav>
  );
};

export default Navbar;
