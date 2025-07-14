import { useTrading } from "@/context/TradingContext";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  formatPrice,
  formatNumber,
  formatPercentageChange,
  getPriceChangeColor,
} from "@/lib/utils";
const Header: React.FC<{ onToggleSidebar: () => void }> = ({
  onToggleSidebar,
}) => {
  const { state } = useTrading();
  const t = useTranslations("spot.header");

  // Check if data is stale (older than 60 seconds)
  const isDataStale = Date.now() - state.currentPrice.timestamp > 60000;
  return (
    <div className="bg-[#07153b] px-4 py-3 flex items-center justify-between border-b border-slate-700">
      <div className="flex items-center space-x-4">
        {/* Mobile menu button */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
            ₿
          </div>
          <span className="text-lg font-semibold">{t("pair")}</span>
          <span
            className={`text-xl lg:text-2xl font-bold font-mono ${
              isDataStale ? "opacity-50" : ""
            }`}
          >
            {formatPrice(state.currentPrice.price)}
          </span>
        </div>

        <div className="hidden md:flex text-sm text-gray-400 space-x-4">
          <span>
            {t("change24h")}:{" "}
            <span className={getPriceChangeColor(state.currentPrice.change24h)}>
              {formatPercentageChange(state.currentPrice.change24h)}
            </span>
          </span>
          <span className="hidden lg:inline">
            {t("high24h")}: {formatPrice(state.currentPrice.high24h)}
          </span>
          <span className="hidden lg:inline">
            {t("low24h")}: {formatPrice(state.currentPrice.low24h)}
          </span>
          <span className="hidden xl:inline">
            {t("volume24h")}: {formatNumber(state.currentPrice.volume24h)}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-400">
        <div
          className={`w-2 h-2 rounded-full ${
            state.isConnected ? "bg-green-400" : "bg-red-400"
          }`}
        ></div>
        <span className="hidden sm:inline">
          {state.isConnected ? "Live" : "Offline"}
        </span>
      </div>
    </div>
  );
};

export default Header;
