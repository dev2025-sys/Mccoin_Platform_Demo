"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import AnimatedLogo from "../custom/AnimatedLogoDark";
import UserAvatarDropdown from "./UserAvatarDropdown";
import LanguageDropdown from "./LanguageDropdown";
import NavLink from "./NavLink";
import SupportDropdown from "./SupportDropdown";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const t = useTranslations("navbar");
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="mx-auto h-16 xl:max-w-[70%] bg-[#07153B] text-white px-6 flex items-center justify-between shadow-lg relative z-50">
        <Link href="/" className="flex items-center gap-2">
          <AnimatedLogo />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-10 text-sm tracking-wide text-[#DAE6EA]">
          <Link
            target="_blank"
            href="https://mc-coin-new-website.vercel.app/en"
            className="text-white"
          >
            {t("home")}
          </Link>
          <NavLink href="/market-overview" label={t("market")} />
          {isLoaded && user && <NavLink href="/spot" label={t("spot")} />}
          <NavLink href="/dashboard/assets" label={t("assets")} />
          <NavLink href="/news" label={t("news")} />
          <SupportDropdown />
        </div>

        <div className="flex items-center gap-4">
          <UserAvatarDropdown />
          <LanguageDropdown />
          {/* Burger Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-white focus:outline-none"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={closeMobileMenu}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="absolute right-0 top-16 w-64 bg-[#07153B] h-[calc(100vh-4rem)] shadow-xl"
            >
              <div className="flex flex-col p-4 space-y-4 text-[#DAE6EA]">
                <Link
                  target="_blank"
                  href="https://mc-coin-new-website.vercel.app/en"
                  onClick={closeMobileMenu}
                  className={`px-4 py-2 rounded-md transition-colors duration-200 text-white`}
                >
                  {t("home")}
                </Link>
                <Link
                  href="/market-overview"
                  onClick={closeMobileMenu}
                  className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                    pathname.includes("/market-overview")
                      ? "bg-[#EC3B3B] text-white"
                      : "hover:bg-[#0f294d] hover:text-white"
                  }`}
                >
                  {t("market")}
                </Link>
                {isLoaded && user && (
                  <Link
                    href="/spot"
                    onClick={closeMobileMenu}
                    className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                      pathname.includes("/spot")
                        ? "bg-[#EC3B3B] text-white"
                        : "hover:bg-[#0f294d] hover:text-white"
                    }`}
                  >
                    {t("spot")}
                  </Link>
                )}
                <Link
                  onClick={closeMobileMenu}
                  href="/dashboard/assets"
                  className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                    pathname.includes("/dashboard/assets")
                      ? "bg-[#EC3B3B] text-white"
                      : "hover:bg-[#0f294d] hover:text-white"
                  }`}
                >
                  {t("assets")}
                </Link>
                <Link
                  href="/news"
                  onClick={closeMobileMenu}
                  className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                    pathname.includes("/news")
                      ? "bg-[#EC3B3B] text-white"
                      : "hover:bg-[#0f294d] hover:text-white"
                  }`}
                >
                  {t("news")}
                </Link>
                <SupportDropdown isMobile={true} onClose={closeMobileMenu} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
