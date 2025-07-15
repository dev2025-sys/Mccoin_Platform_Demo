"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type SupportDropdownProps = {
  isMobile?: boolean;
  onClose?: () => void;
};

export default function SupportDropdown({
  isMobile = false,
  onClose,
}: SupportDropdownProps) {
  const t = useTranslations("navbar");
  const locale = useLocale();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const supportItems = [
    { href: "/support/contact", label: t("contact") },
    { href: "/support/faqs", label: t("faq") },
    { href: "/support/help-topics", label: t("helpTopics") },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const isActive = pathname.includes("/support");

  if (isMobile) {
    return (
      <div className="space-y-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center cursor-pointer justify-between w-full px-4 py-2 text-[#DAE6EA] font-medium hover:bg-[#0f294d] hover:text-white rounded-md transition-colors duration-200"
        >
          <span>{t("support")}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-1">
                {supportItems.map((item) => {
                  const fullHref = `/${locale}${item.href}`;
                  const isItemActive =
                    pathname === fullHref ||
                    pathname.startsWith(`${fullHref}/`);

                  return (
                    <Link
                      key={item.href}
                      href={fullHref}
                      onClick={handleItemClick}
                      className={`block px-8 py-2 rounded-md transition-colors duration-200 ${
                        isItemActive
                          ? "bg-[#EC3B3B] text-white"
                          : "hover:bg-[#0f294d] hover:text-white text-[#DAE6EA]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-1 cursor-pointer transform-gpu transition-colors transition-transform duration-300
          ${isActive ? "text-white scale-105" : "text-[#DAE6EA]"}
          hover:text-white
        `}
      >
        <span className="relative z-10">{t("support")}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
        {isActive && (
          <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-[#EC3B3B] rounded-full animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-48 bg-[#07153B] border border-[#0f294d] rounded-lg shadow-xl z-50"
          >
            <div className="py-2">
              {supportItems.map((item) => {
                const fullHref = `/${locale}${item.href}`;
                const isItemActive =
                  pathname === fullHref || pathname.startsWith(`${fullHref}/`);

                return (
                  <Link
                    key={item.href}
                    href={fullHref}
                    onClick={handleItemClick}
                    className={`
                      block px-4 py-2 text-sm transition-colors duration-200
                      ${
                        isItemActive
                          ? "bg-[#EC3B3B] text-white"
                          : "text-[#DAE6EA] hover:bg-[#0f294d] hover:text-white"
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
