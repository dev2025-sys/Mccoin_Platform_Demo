import { useTrading } from "@/context/TradingContext";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
const Header: React.FC<{ onToggleSidebar: () => void }> = ({
  onToggleSidebar,
}) => {
  const { state } = useTrading();
  const t = useTranslations("spot.header");
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
          <span className="text-xl lg:text-2xl font-bold font-mono">
            {state.currentPrice.price.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="hidden md:flex text-sm text-gray-400 space-x-4">
          <span>
            {t("change24h")}:{" "}
            <span
              className={
                state.currentPrice.change24h >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              {state.currentPrice.change24h >= 0 ? "+" : ""}
              {state.currentPrice.change24h.toFixed(2)}%
            </span>
          </span>
          <span className="hidden lg:inline">
            {t("high24h")}: {state.currentPrice.high24h.toFixed(2)}
          </span>
          <span className="hidden lg:inline">
            {t("low24h")}: {state.currentPrice.low24h.toFixed(2)}
          </span>
          <span className="hidden xl:inline">
            {t("volume24h")}: {state.currentPrice.volume24h.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-400">
        <span>🕒</span>
        <span className="hidden sm:inline">{t("about")}</span>
      </div>
    </div>
  );
};

export default Header;
