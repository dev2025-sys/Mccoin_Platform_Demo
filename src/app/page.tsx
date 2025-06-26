"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/shared/Navbar";
import { motion } from "framer-motion";
import { ArrowRight, Bitcoin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import Footer from "@/components/shared/Footer";

// Crypto exchange rates (can be replaced with API calls)
const EXCHANGE_RATES = {
  BTC: { USD: 68542.73 },
  ETH: { USD: 3821.45 },
  SOL: { USD: 142.67 },
};

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("0.015");
  const [fromCurrency, setFromCurrency] = useState("BTC");
  const [toCurrency, setToCurrency] = useState("USD");
  const [convertedAmount, setConvertedAmount] = useState(103.01);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Calculate conversion
  const calculateConversion = () => {
    const rate =
      EXCHANGE_RATES[fromCurrency as keyof typeof EXCHANGE_RATES]?.[
        toCurrency as "USD"
      ];
    if (rate) {
      setConvertedAmount(parseFloat(amount) * rate);
    }
  };

  useEffect(() => {
    calculateConversion();
  }, [amount, fromCurrency, toCurrency]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07153B] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC3B3B] mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#07153B] text-white">
      <Navbar />
      <main className="mx-auto xl:max-w-[70%] py-12 md:pt-40">
        <section className="flex flex-col lg:flex-row gap-12 items-center justify-between w-full">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 space-y-8 max-w-xl w-full"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight md:text-left text-center">
              Invest in
              <span className="font-bold">
                Mc
                <span
                  className="text-[#EC3B3B] inline-block"
                  style={{ fontFamily: "inherit" }}
                >
                  C
                </span>
                <span className="inline-block" style={{ color: "#fff" }}>
                  o
                </span>
                in
              </span>
              <br />
              <span className="text-white">Way to Trade</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-lg ml-2 md:text-left text-center ">
              The global crypto currency exchange
            </p>
            {/* Email input with floating Register button */}
            <div className="relative max-w-md w-full mt-8 mx-auto md:mx-0">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#050E27] border border-slate-600 text-white placeholder-[#8CA3D5] rounded-full pl-6 pr-40 py-4 text-base focus:ring-0 focus:outline-none shadow-none"
                style={{ boxShadow: "none" }}
              />
              <Link href="/sign-up">
                <Button
                  type="button"
                  className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-[#EC3B3B] hover:bg-[#D13535] px-7 font-normal text-base shadow-none"
                  style={{ minWidth: 120 }}
                >
                  Register now
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
                Crypto Calculator
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
                    <Bitcoin className="h-4 w-4 text-[#F7931A]" />
                    <Select
                      value={fromCurrency}
                      onValueChange={setFromCurrency}
                    >
                      <SelectTrigger className="bg-transparent border-none text-white px-0 focus:ring-0 focus:outline-none">
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#07153B] border-none hover:bg-[#07153B]">
                        <SelectItem
                          className="bg-[#07153B] text-[#FFF] hover:bg-[#07153B]"
                          value="BTC"
                        >
                          BTC
                        </SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="SOL">SOL</SelectItem>
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
                    <DollarSign className="h-4 w-4 text-[#fff]" />
                    <Select value={toCurrency} onValueChange={setToCurrency}>
                      <SelectTrigger className="bg-transparent border-none text-white px-0 focus:ring-0 focus:outline-none">
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#050E27] border-[#22304A]">
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Buttons */}
                <div className="flex gap-4 pt-2">
                  <Button
                    onClick={calculateConversion}
                    className="flex-1 rounded-full border border-[#EC3B3B] bg-transparent text-[#8CA3D5] hover:bg-[#10194A] shadow-none"
                  >
                    Calculate
                  </Button>
                  <Button className="flex-1 rounded-full bg-[#EC3B3B] hover:bg-[#D13535] text-white shadow-none">
                    Buy now
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
