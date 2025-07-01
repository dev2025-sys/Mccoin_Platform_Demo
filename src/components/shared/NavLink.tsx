"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

type NavLinkProps = {
  href: string; // e.g. '/market-overview'
  label: string;
};

export default function NavLink({ href, label }: NavLinkProps) {
  const locale = useLocale(); // 'en' | 'ar' | …
  const pathname = usePathname() || "/"; // Add default value
  const fullHref = `/${locale}${href}`; // '/ar/market-overview'

  const isActive = pathname === fullHref || pathname.startsWith(`${fullHref}/`);

  return (
    <Link
      href={fullHref}
      className={`
        relative transform-gpu transition-colors transition-transform duration-300
        ${isActive ? "text-white scale-105" : "text-[#DAE6EA]"}
        hover:text-white
      `}
    >
      <span className="relative z-10">{label}</span>

      {isActive && (
        <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-[#EC3B3B] rounded-full animate-pulse" />
      )}
    </Link>
  );
}
