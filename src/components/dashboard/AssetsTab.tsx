"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Upload } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
}

export default function AssetsTab() {
  const t = useTranslations("dashboard.assets");
  const isArabic = useLocale() === "ar";
  const [coins, setCoins] = useState<Coin[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd")
      .then((res) => res.json())
      .then((data) => setCoins(data.slice(0, 20)))
      .catch((err) => console.error(err));
  }, []);

  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(search.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <Card className="bg-[#081935] shadow-2xl border-[0.5px] rounded-md border-[#DAE6EA]">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="text-white">
            <p className="text-sm text-[#DAE6EA]">{t("estimated")}</p>
            <h2 className="text-3xl font-semibold">0 USD</h2>
          </div>
          <Button className="bg-[#EC3B3B] hover:bg-[#d02f2f] cursor-pointer">
            <Upload className="w-4 h-4 mr-2" /> {t("deposit")}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-[#081935] shadow-2xl border-[0.5px] rounded-md border-[#DAE6EA]">
        <CardContent className="p-6">
          <div className="text-white mb-4 text-xl font-semibold">
            {t("assets")}
          </div>

          <div className="relative mb-4">
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#0f294d] text-white border border-[#DAE6EA] pl-10"
            />
            <Search
              className={`absolute ${
                isArabic ? "left-3" : "right-3"
              } top-2.5 text-red-500 w-4 h-4`}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-white">
              <thead className="text-[#DAE6EA] border-b border-[#0f294d]">
                <tr>
                  <th
                    className={`text-left py-2 ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {t("table.coin")}
                  </th>
                  <th
                    className={`text-left py-2 ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {t("table.available")}
                  </th>
                  <th
                    className={`text-left py-2 ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {t("table.frozen")}
                  </th>
                  <th
                    className={`text-left py-2 ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {t("table.operation")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCoins.map((coin) => (
                  <tr key={coin.id} className="border-b border-[#0f294d]">
                    <td className="py-2 flex items-center gap-2">
                      <Image
                        src={coin.image}
                        alt={coin.name}
                        width={20}
                        height={20}
                        style={{ width: "auto", height: "auto" }}
                      />
                      {coin.symbol.toUpperCase()}
                    </td>
                    <td>0</td>
                    <td>0</td>
                    <td>
                      <Button variant="ghost" className="text-red-400">
                        {t("deposit")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
