import { useTrading } from "@/context/TradingContext";
import type React from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { useLocale } from "next-intl";
// Markets component for the left sidebar
const Markets: React.FC = () => {
  const { state } = useTrading();
  const t = useTranslations("spot.markets");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const marketData = [
    { symbol: "USDT", price: 1.0001, change: 0.0, pair: "USDT" },
    {
      symbol: "BTC/USDT",
      price: state.currentPrice.price,
      change: state.currentPrice.change24h,
      pair: "BTC/USDT",
    },
    { symbol: "ETH/USDT", price: 2641.89, change: -6.46, pair: "ETH/USDT" },
    { symbol: "BNB/USDT", price: 723.8, change: -3.99, pair: "BNB/USDT" },
    { symbol: "ADA/USDT", price: 1.09, change: -5.04, pair: "ADA/USDT" },
    { symbol: "SOL/USDT", price: 245.1, change: -8.02, pair: "SOL/USDT" },
    { symbol: "AVAX/USDT", price: 89.45, change: -3.8, pair: "AVAX/USDT" },
  ];

  const latestExecutions = [
    {
      price: state.currentPrice.price,
      amount: 0.001,
      time: "17:42:05",
      side: "buy",
    },
    {
      price: state.currentPrice.price - 3,
      amount: 0.012,
      time: "17:42:05",
      side: "sell",
    },
    {
      price: state.currentPrice.price + 1,
      amount: 0.004,
      time: "17:42:05",
      side: "buy",
    },
    {
      price: state.currentPrice.price - 4,
      amount: 0.032,
      time: "17:42:05",
      side: "sell",
    },
    {
      price: state.currentPrice.price,
      amount: 0.12,
      time: "17:42:05",
      side: "buy",
    },
  ];

  return (
    <div className="w-full lg:w-64 bg-[#07153b] border-r border-slate-700">
      {/* Markets Section */}
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center space-x-2">
          <span>{t("title")}</span>
          {state.isConnected && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </h3>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            className="w-full bg-slate-700 text-white px-3 py-2 rounded text-sm placeholder-gray-400"
          />
          <Search
            className={`absolute ${
              isArabic ? "left-3" : "right-3"
            } top-2.5 text-gray-400 `}
            size={16}
            strokeWidth={1.5}
          />
        </div>

        {/* Market List */}
        <div className="space-y-1">
          {marketData.map((market, index) => (
            <div
              key={market.symbol}
              className={`flex items-center justify-between p-2 text-sm rounded cursor-pointer hover:bg-slate-700/50 transition-colors ${
                index === 0 ? "bg-slate-700" : ""
              }`}
            >
              <div>
                <div className="font-semibold">{market.symbol}</div>
                <div className="text-gray-400">
                  {market.price.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={
                    market.change >= 0 ? "text-green-400" : "text-red-400"
                  }
                >
                  {market.change >= 0 ? "+" : ""}
                  {market.change.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Executions */}
      <div className="p-4 border-t border-slate-700">
        <h3 className="text-sm font-semibold mb-3">{t("latestExecutions")}</h3>
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-3 gap-2 text-gray-400">
            <span>{t("price")} (USDT)</span>
            <span>{t("amount")} (BTC)</span>
            <span>{t("time")}</span>
          </div>

          {latestExecutions.map((execution, index) => (
            <div key={index} className="grid grid-cols-3 gap-2">
              <span
                className={
                  execution.side === "buy" ? "text-green-400" : "text-red-400"
                }
              >
                {execution.price.toFixed(2)}
              </span>
              <span>{execution.amount.toFixed(3)}</span>
              <span className="text-gray-400">{execution.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Markets;
