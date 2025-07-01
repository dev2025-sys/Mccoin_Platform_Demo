import { useTranslations } from "next-intl";
import { FaInstagram, FaTwitter, FaYoutube, FaEnvelope } from "react-icons/fa";
import { Heart, LifeBuoy } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  const isArabic = useLocale() === "ar";
  return (
    <footer className="bg-[#050E27] rounded-xl py-8 px-4 mt-16 xl:max-w-[70%] w-full mx-auto pb-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-6 gap-8 items-start">
        <div className="space-y-3 col-span-1 md:col-span-3">
          <div
            className="w-full text-white flex justify-center md:justify-start items-center text-2xl font-bold"
            style={{
              direction: isArabic ? "rtl" : "ltr",
            }}
            dir="ltr"
          >
            McCoin
          </div>
          <div className="text-[#8CA3D5] text-sm md:text-left text-center">
            {t("tagline")}
          </div>
          <div className="text-[#8CA3D5] text-xs mt-12 md:text-left text-center">
            ©2025 McCoin.Com. {t("copyright")}
          </div>
        </div>

        <div className="flex flex-col gap-2 text-white text-sm col-span-2 md:col-span-2 items-center">
          <Link href="#" className="hover:underline">
            {t("market")}
          </Link>
          <Link href="#" className="hover:underline">
            {t("spot")}
          </Link>
          <Link href="#" className="hover:underline">
            {t("privacy")}
          </Link>
          <Link href="#" className="hover:underline">
            {t("terms")}
          </Link>
          <Link href="#" className="hover:underline">
            {t("about")}
          </Link>
        </div>

        <div className="flex flex-col gap-14 col-span-1 md:col-span-1 items-center md:items-end">
          <div className="flex flex-col gap-4 text-white text-sm w-full items-center md:items-end">
            <Link href="#" className="flex items-center gap-2 hover:underline">
              <Heart className="w-4 h-4 text-[#EC3B3B]" /> {t("partners")}
            </Link>
            <Link href="#" className="flex items-center gap-2 hover:underline">
              <LifeBuoy className="w-4 h-4 text-[#EC3B3B]" /> {t("help")}
            </Link>
          </div>
          <div className="flex gap-4  items-center mt-4 md:mt-0 w-full justify-center md:justify-end">
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
