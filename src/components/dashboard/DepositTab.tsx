"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
export default function DepositTab() {
  const t = useTranslations("dashboard.deposit");
  const isArabic = useLocale() === "ar";
  const [selectedCoin, setSelectedCoin] = useState<string>("");
  const [agree, setAgree] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");

  const confirmations = [selectedCoin, selectedNetwork, agree].filter(
    Boolean
  ).length;
  const allConfirmed = confirmations === 3;

  const depositNetworks = [
    "USDT-OKTC",
    "USDT-ERC20",
    "USDT-TRC20",
    "USDT-Polygon",
    "USDT-Solana",
    "USDT-Avalanche C-Chain",
    "USDT-Arbitrum One",
    "USDT-Optimism",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Total Assets Card */}
      <Card className="bg-[#081935] shadow-2xl border-[0.5px] rounded-md border-[#DAE6EA]">
        <CardContent className="p-6 space-y-4">
          <div className="text-white text-xl font-semibold">
            {t("totalAssets")}
          </div>
          <div className="text-white grid grid-cols-2 gap-4">
            <div>
              <p>{t("available")}</p>
              <p className="text-sm text-[#DAE6EA]">USDT</p>
              <p className="mt-2">{t("frozen")}</p>
              <p className="text-sm text-[#DAE6EA]">USDT</p>
            </div>
            <div className="flex justify-end items-center">
              <div className="w-20 h-20 rounded-full border-[6px] border-red-500 border-r-[#DAE6EA] rotate-45"></div>
            </div>
          </div>
          <div className="bg-[#0f294d] p-4 rounded-md border border-[#DAE6EA] text-white space-y-1">
            <p className="text-red-500 font-semibold">⚠ {t("attention")}</p>
            <div className="flex justify-between text-sm">
              <span>{t("minimumDeposit")}</span>
              <span className="text-[#DAE6EA]">0.00000001 USDT</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t("crediting")}</span>
              <span
                className={`font-semibold ${
                  allConfirmed ? "text-green-400" : "text-red-500"
                }`}
              >
                {allConfirmed
                  ? t("allConfirmed")
                  : t("confirmationsLeft", { count: 3 - confirmations })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deposit Section */}
      <Card className="bg-[#081935] shadow-2xl border-[0.5px] rounded-md border-[#DAE6EA]">
        <CardContent className="p-6 space-y-6 text-white">
          <div className="text-xl font-semibold">{t("depositTitle")}</div>

          {/* Coin Selector */}
          <div className="space-y-2">
            <label>Select Coin / Token</label>
            <Select onValueChange={(val) => setSelectedCoin(val)}>
              <SelectTrigger className="bg-[#0f294d] text-white border border-[#DAE6EA]">
                {selectedCoin || "Select Coin"}
              </SelectTrigger>
              <SelectContent className="bg-[#0f294d] text-white">
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="BTC">BTC</SelectItem>
                <SelectItem value="ETH">ETH</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Deposit Network */}
          <div className="space-y-2">
            <label>{t("generateAddress")}</label>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {depositNetworks.map((network) => (
                <motion.div
                  layout
                  key={network}
                  onClick={() => setSelectedNetwork(network)}
                  className={`cursor-pointer bg-[#0f294d] px-3 py-2 rounded border transition-all duration-300 ${
                    selectedNetwork === network
                      ? "border-green-400"
                      : "border-[#DAE6EA]"
                  }`}
                >
                  Tether
                  <br />
                  {network}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Risk Reminder */}
          <div className="bg-[#0f294d] text-sm p-4 rounded border border-[#DAE6EA]">
            <p className="text-red-500 font-semibold mb-1">{t("riskTitle")}</p>
            <p className="text-[#DAE6EA]">{t("riskMessage")}</p>
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="agree"
                checked={agree}
                onCheckedChange={(val) => setAgree(val === true)}
              />
              <label htmlFor="agree" className="text-white">
                {t("checkboxLabel")}
              </label>
            </div>
          </div>

          {/* Confirm Button */}
          <Button
            className="bg-[#EC3B3B] hover:bg-[#d02f2f]"
            disabled={!allConfirmed}
          >
            {t("confirm")}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
