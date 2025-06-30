import Image from "next/image";
import { useEffect, useState } from "react";
import { CoinData, formatPrice, formatPriceChange } from "@/utils/coingecko";
import { useTranslations } from "next-intl";
interface TopMoversProps {
  title: string;
  type: "gainers" | "losers" | "volume";
  data: CoinData[];
}

export default function TopMovers({ title, type, data }: TopMoversProps) {
  const t = useTranslations("marketOverview.topMovers");
  return (
    <div className="bg-[#050E27] rounded-lg p-4">
      <h2 className="text-lg font-medium mb-4">{title}</h2>

      {/* Header */}
      <div className="grid grid-cols-12 text-xs text-slate-400 mb-2 px-2">
        <div className="col-span-3">{t("coin")}</div>
        <div className="col-span-5 text-right">{t("price")}</div>
        <div className="col-span-4 text-right">{t("change24h")}</div>
      </div>

      {/* Coin List */}
      <div className="space-y-0">
        {data.map((coin, index) => (
          <div
            key={coin.id}
            className={`grid grid-cols-12 items-center text-sm py-2.5 px-2 hover:bg-[#162554] transition-colors duration-200 cursor-pointer border-b border-slate-700/20 ${
              index % 2 === 0 ? "bg-[#0c1e4e]/30" : ""
            }`}
          >
            <div className="col-span-3 flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image
                  src={coin.image}
                  alt={coin.name}
                  fill
                  className="rounded-full"
                />
              </div>
              <span className="font-medium">{coin.symbol.toUpperCase()}</span>
            </div>
            <div className="col-span-5 text-right font-medium">
              {formatPrice(coin.current_price)}
            </div>
            <div
              className={`col-span-4 text-right font-medium ${
                coin.price_change_percentage_24h > 0
                  ? "text-[#22c55e]"
                  : "text-[#ef4444]"
              }`}
            >
              {formatPriceChange(coin.price_change_percentage_24h)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
