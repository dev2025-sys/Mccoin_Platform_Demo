"use client";
import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, DollarSign, BarChart2 } from "lucide-react";
import Link from "next/link";

const tabs = [
  {
    name: "Overview",
    href: "overview",
    icon: Home,
  },
  {
    name: "FundingAccount",
    href: "funding-account",
    icon: DollarSign,
  },
  {
    name: "TradingAccount",
    href: "trading-account",
    icon: BarChart2,
  },
];

export default function AssetsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const base = pathname.split("/").slice(0, -1).join("/");

  return (
    <div className="bg-[#050E27] min-h-screen rounded-b-xl">
      <div className="flex flex-col sm:flex-row space-x-0 relative top-[2px] z-10 overflow-x-auto">
        {tabs.map((tab) => {
          const active = pathname.endsWith(tab.href);
          return (
            <Link
              key={tab.name}
              href={`${base}/${tab.href}`}
              className={`flex-1 text-center py-4 px-4 sm:py-5 sm:px-8 font-medium text-sm sm:text-lg transition-all duration-300 relative whitespace-nowrap ${
                active
                  ? "text-[#EC3B3B] shadow-2xl z-20 transform translate-y-[-4px] bg-[#081935] border border-[#22304A] mt-1"
                  : "bg-transparent text-[#DAE6EA]/70 hover:text-[#DAE6EA] hover:translate-y-[-2px] hover:shadow-lg  border border-transparent mt-1"
              }`}
              scroll={false}
            >
              <div className="flex flex-col items-center">
                <tab.icon className="mb-1 w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{tab.name}</span>
                <span className="sm:hidden text-xs">
                  {tab.name.split(/(?=[A-Z])/).join(" ")}
                </span>
              </div>
              {active && (
                <motion.div
                // layoutId="tab-underline"
                // className="absolute left-0 right-0 -bottom-1 h-1 bg-[#EC3B3B] rounded-t-lg shadow-lg"
                // transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
      <div className="p-4 sm:p-8">{children}</div>
    </div>
  );
}
