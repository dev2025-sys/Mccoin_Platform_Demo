"use client";
import { useTranslations } from "next-intl";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/shared/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Euro } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "next-intl";
import { FaEthereum, FaBitcoin } from "react-icons/fa";
import { SiSolana } from "react-icons/si";
import { TbCurrencyDogecoin } from "react-icons/tb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import Footer from "@/components/shared/Footer";
import toast from "react-hot-toast";

// Crypto exchange rates (can be replaced with API calls)
const EXCHANGE_RATES = {
  BTC: { USD: 109375, EUR: 100000, AED: 390000 },
  ETH: { USD: 2589.8, EUR: 2300, AED: 9000 },
  SOL: { USD: 155.65, EUR: 132.23, AED: 523.96 },
};

export default function HomePage() {
  const isArabic = useLocale() === "ar";
  const t = useTranslations("homepage");
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("0.015");
  const [fromCurrency, setFromCurrency] = useState("BTC");
  const [toCurrency, setToCurrency] = useState("USD");
  const [convertedAmount, setConvertedAmount] = useState(103.01);
  const [isRegistering, setIsRegistering] = useState(false);

  // Calculate conversion
  const calculateConversion = () => {
    const rate =
      EXCHANGE_RATES[fromCurrency as keyof typeof EXCHANGE_RATES]?.[
        toCurrency as keyof (typeof EXCHANGE_RATES)["BTC"]
      ];
    if (rate) {
      setConvertedAmount(parseFloat(amount) * rate);
    }
  };

  useEffect(() => {
    calculateConversion();
  }, [amount, fromCurrency, toCurrency]);

  const handleRegisterClick = () => {
    setIsRegistering(true);
    setTimeout(() => {
      router.push(`/sign-up?email=${encodeURIComponent(email)}`);
    }, 800);
  };

  const renderContent = () => {
    if (!isLoaded) {
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC3B3B] mx-auto"></div>
            <p className="mt-4">Loading...</p>
          </div>
        </div>
      );
    }

    return (
      <section className="flex flex-col lg:flex-row gap-12 items-center justify-between w-full">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex lg:block flex-col items-center flex-1 space-y-8 max-w-xl w-full"
        >
          <h1
            className={`text-4xl md:text-5xl lg:text-6xl leading-tight ${
              isArabic ? "md:text-right" : "md:text-left"
            }  text-center`}
          >
            <span>{t("hero.headlinePrefix")}</span>{" "}
            <span className="font-bold">
              Mc
              <span className="text-[#EC3B3B] inline-block">C</span>
              <span className="inline-block text-white">o</span>
              in
            </span>
            <br />
            <span className="text-white">{t("hero.subheadline")}</span>
          </h1>
          <div
            className={`text-lg text-slate-300 max-w-lg ml-2 ${
              isArabic ? "md:text-right" : "md:text-left"
            } text-center`}
          >
            <p>{t("hero.description")}</p>
          </div>

          {/* Email input with Register button */}
          <div className="relative max-w-md w-full mt-8 mx-auto md:mx-0">
            <Input
              type="email"
              placeholder={t("form.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#050E27] border border-slate-600 text-white placeholder-[#8CA3D5] rounded-full pl-6 pr-40 py-4 text-base focus:ring-0 focus:outline-none shadow-none"
              style={{ boxShadow: "none" }}
            />
            <Link
              href={`/sign-up?email=${encodeURIComponent(email)}`}
              className="absolute right-0 top-1/2 -translate-y-1/2"
            >
              <Button
                type="button"
                className="rounded-full bg-[#EC3B3B] hover:bg-[#D13535] px-7 font-normal text-base shadow-none"
                style={{ minWidth: 120 }}
              >
                {t("form.registerButton")}
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Crypto Calculator */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 max-w-md w-full rounded-2xl flex flex-col items-center"
        >
          <div className="w-full max-w-md">
            <h2 className="text-2xl mb-8 ml-2 text-white">
              {t("calculator.title")}
            </h2>
            <div className="space-y-4">
              {/* From Currency */}
              <div className="relative">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-full bg-[#07153B] border border-slate-600 text-white text-base py-3 pl-6 pr-32 focus:ring-0 focus:outline-none placeholder-[#8CA3D5]"
                  placeholder="0.00"
                />
                <div className="absolute right-[0.3rem] top-1/2 -translate-y-1/2 flex items-center gap-2 bg-[#07153B] rounded-full px-4 py-[0.1rem] border border-slate-600">
                  {fromCurrency === "BTC" ? (
                    <FaBitcoin className="h-4 w-4 text-[#F7931A]" />
                  ) : fromCurrency === "ETH" ? (
                    <FaEthereum className="h-4 w-4 text-blue-400" />
                  ) : (
                    <SiSolana className="h-4 w-4 text-green-400" />
                  )}
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger className="bg-transparent border-none text-white px-0 focus:ring-0 focus:outline-none">
                      <SelectValue placeholder={t("calculator.from")} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#07153B] border-none hover:bg-[#07153B]">
                      <SelectItem
                        className="bg-[#07153B] text-[#FFF] hover:bg-[#07153B]"
                        value="BTC"
                      >
                        BTC
                      </SelectItem>
                      <SelectItem
                        className="bg-[#07153B] text-[#FFF] hover:bg-[#07153B]"
                        value="ETH"
                      >
                        ETH
                      </SelectItem>
                      <SelectItem
                        className="bg-[#07153B] text-[#FFF] hover:bg-[#07153B]"
                        value="SOL"
                      >
                        SOL
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* To Currency */}
              <div className="relative">
                <input
                  type="number"
                  value={convertedAmount.toFixed(2)}
                  readOnly
                  className="w-full rounded-full bg-[#07153B] border border-slate-600 text-white text-base py-3 pl-6 pr-32 focus:ring-0 focus:outline-none placeholder-[#8CA3D5]"
                  placeholder="0.00"
                />
                <div className="absolute right-[0.3rem] top-1/2 -translate-y-1/2 flex items-center gap-2 bg-[#07153B] rounded-full px-4 py-[0.1rem] border border-slate-600">
                  {toCurrency === "USD" ? (
                    <DollarSign className="h-4 w-4 text-[#fff]" />
                  ) : toCurrency === "EUR" ? (
                    <Euro className="h-4 w-4 text-[#fff]" />
                  ) : (
                    <TbCurrencyDogecoin className="h-4 w-4 text-[#fff]" />
                  )}
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger className="bg-transparent border-none text-white px-0 focus:ring-0 focus:outline-none">
                      <SelectValue placeholder={t("calculator.to")} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#050E27] border-[#22304A]">
                      <SelectItem
                        className="bg-[#050E27] text-[#FFF] hover:bg-[#07153B]"
                        value="USD"
                      >
                        USD
                      </SelectItem>
                      <SelectItem
                        className="bg-[#050E27] text-[#FFF] hover:bg-[#07153B]"
                        value="EUR"
                      >
                        EUR
                      </SelectItem>
                      <SelectItem
                        className="bg-[#050E27] text-[#FFF] hover:bg-[#07153B]"
                        value="AED"
                      >
                        AED
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Buttons */}
              <div className="flex gap-4 pt-2">
                <Button
                  onClick={() => {
                    if (!isSignedIn) {
                      router.push("/sign-in");
                    } else {
                      router.push("/dashboard/assets");
                    }
                  }}
                  className="w-full rounded-full bg-[#EC3B3B] hover:bg-[#D13535] text-white shadow-none"
                >
                  {t("calculator.buyNow")}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-[#07153B] text-white">
      <Navbar />
      <main className="mx-auto xl:max-w-[70%] py-12 md:pt-40 xl:px-0 px-4">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}
