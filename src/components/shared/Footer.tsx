import { FaInstagram, FaTwitter, FaYoutube, FaEnvelope } from "react-icons/fa";
import { Heart, LifeBuoy } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#050E27] rounded-xl py-8 px-4 mt-16 xl:max-w-[70%] w-full mx-auto pb-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-6 gap-8 items-start">
        {/* Logo and tagline (60%) */}
        <div className="space-y-3 col-span-1 md:col-span-3">
          <div className="flex items-center text-2xl font-bold">
            <span className="text-white">McC</span>
            <span className="text-[#EC3B3B]">o</span>
            <span className="text-white">in</span>
          </div>
          <div className="text-[#8CA3D5] text-sm">
            Making Crypto Trading Easier
          </div>
          <div className="text-[#8CA3D5] text-xs mt-12">
            ©2023 McCoin.Com. All Rights Reserved.
          </div>
        </div>

        {/* Navigation links (10%) */}
        <div className="flex flex-col gap-2 text-white text-sm col-span-2 md:col-span-2 md:items-center">
          <Link href="#" className="hover:underline">
            Market
          </Link>
          <Link href="#" className="hover:underline">
            Spot
          </Link>
          <Link href="#" className="hover:underline">
            Privacy
          </Link>
          <Link href="#" className="hover:underline">
            Terms
          </Link>
          <Link href="#" className="hover:underline">
            About
          </Link>
        </div>

        {/* Partners & Help + Social icons (30%) */}
        <div className="flex flex-col gap-14 col-span-1 md:col-span-1 items-start md:items-end">
          <div className="flex flex-col gap-4 text-white text-sm w-full md:items-end">
            <Link href="#" className="flex items-center gap-2 hover:underline">
              <Heart className="w-4 h-4 text-[#EC3B3B]" /> McCoin Partners
            </Link>
            <Link href="#" className="flex items-center gap-2 hover:underline">
              <LifeBuoy className="w-4 h-4 text-[#EC3B3B]" /> Help Center
            </Link>
          </div>
          <div className="flex gap-4  items-center mt-4 md:mt-0 w-full md:justify-end">
            <a
              href="#"
              aria-label="Instagram"
              className="text-white hover:text-[#EC3B3B]"
            >
              <FaInstagram size={22} />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="text-white hover:text-[#EC3B3B]"
            >
              <FaTwitter size={22} />
            </a>
            <a
              href="#"
              aria-label="YouTube"
              className="text-white hover:text-[#EC3B3B]"
            >
              <FaYoutube size={22} />
            </a>
            <a
              href="#"
              aria-label="Email"
              className="text-white hover:text-[#EC3B3B]"
            >
              <FaEnvelope size={22} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
