import { useTrading } from "@/context/TradingContext";
import { Menu, X } from "lucide-react";
const Header: React.FC<{ onToggleSidebar: () => void }> = ({
  onToggleSidebar,
}) => {
  const { state } = useTrading();

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
          <span className="text-lg font-semibold">BTC/USDT</span>
          <span className="text-xl lg:text-2xl font-bold font-mono">
            {state.currentPrice.price.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="hidden md:flex text-sm text-gray-400 space-x-4">
          <span>
            24h Change:{" "}
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
            24h High: {state.currentPrice.high24h.toFixed(2)}
          </span>
          <span className="hidden lg:inline">
            24h Low: {state.currentPrice.low24h.toFixed(2)}
          </span>
          <span className="hidden xl:inline">
            24h Volume: {state.currentPrice.volume24h.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-400">
        <span>🕒</span>
        <span className="hidden sm:inline">About BTC/USDT</span>
      </div>
    </div>
  );
};

export default Header;
