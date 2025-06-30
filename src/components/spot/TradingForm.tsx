import { useTrading } from "@/context/TradingContext";
import type React from "react";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  type: "buy" | "sell";
}

const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  className = "",
  type,
}) => {
  const t = useTranslations("spot.tradingForm");
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const dots = [0, 25, 50, 75, 100];
  const activeColor = type === "buy" ? "#22c55e" : "#ef4444";
  const inactiveColor = "#1e293b";

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={handleSliderChange}
          className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer 
            ${type === "buy" ? "slider-buy" : "slider-sell"}
            focus:outline-none focus:ring-2 focus:ring-offset-2 
            focus:ring-offset-slate-800 
            ${
              type === "buy"
                ? "focus:ring-green-500/20"
                : "focus:ring-red-500/20"
            }`}
          style={{
            background: `linear-gradient(to right, ${activeColor} 0%, ${activeColor} ${value}%, ${inactiveColor} ${value}%, ${inactiveColor} 100%)`,
          }}
        />
        <style jsx>{`
          .slider-buy::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #22c55e;
            border: 2px solid #22c55e;
            cursor: pointer;
            transition: all 0.15s ease-in-out;
          }
          .slider-buy::-webkit-slider-thumb:hover {
            box-shadow: 0 0 0 8px rgba(34, 197, 94, 0.1);
          }
          .slider-sell::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #ef4444;
            border: 2px solid #ef4444;
            cursor: pointer;
            transition: all 0.15s ease-in-out;
          }
          .slider-sell::-webkit-slider-thumb:hover {
            box-shadow: 0 0 0 8px rgba(239, 68, 68, 0.1);
          }
          .slider-buy::-moz-range-thumb,
          .slider-sell::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.15s ease-in-out;
          }
          .slider-buy::-moz-range-thumb {
            background: #22c55e;
            border: 2px solid #22c55e;
          }
          .slider-buy::-moz-range-thumb:hover {
            box-shadow: 0 0 0 8px rgba(34, 197, 94, 0.1);
          }
          .slider-sell::-moz-range-thumb {
            background: #ef4444;
            border: 2px solid #ef4444;
          }
          .slider-sell::-moz-range-thumb:hover {
            box-shadow: 0 0 0 8px rgba(239, 68, 68, 0.1);
          }
        `}</style>
      </div>
      <div className="flex justify-between mt-2">
        {dots.map((dot) => (
          <div key={dot} className="flex flex-col items-center gap-1">
            <div
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                value >= dot
                  ? type === "buy"
                    ? "bg-green-500"
                    : "bg-red-500"
                  : "bg-slate-700"
              }`}
            />
            <span className="text-[10px] text-slate-500">{dot}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface TradingFormProps {
  className?: string;
}

const TradingForm: React.FC<TradingFormProps> = ({ className = "" }) => {
  const { state, placeOrder } = useTrading();
  const [activeTab, setActiveTab] = useState<"limit" | "market">("limit");
  const t = useTranslations("spot.tradingForm");
  const [buyForm, setBuyForm] = useState({
    amount: "",
    price: "",
    total: "",
    postOnly: false,
    reduceOnly: false,
    sliderValue: 20,
  });
  const [sellForm, setSellForm] = useState({
    amount: "",
    price: "",
    total: "",
    postOnly: false,
    stopLoss: false,
    sliderValue: 80,
  });

  // Auto-fill current price for limit orders and initial amounts based on slider values
  useEffect(() => {
    if (activeTab === "limit") {
      const price = state.currentPrice.price;
      setBuyForm((prev) => ({
        ...prev,
        price: price.toFixed(2),
      }));
      setSellForm((prev) => ({
        ...prev,
        price: price.toFixed(2),
      }));

      // Set initial amounts based on slider values
      const availableUSDT = state.portfolio.balances.USDT || 0;
      const availableBTC = state.portfolio.balances.BTC || 0;

      const buyAmount = (
        ((availableUSDT / price) * buyForm.sliderValue) /
        100
      ).toFixed(8);
      const sellAmount = ((availableBTC * sellForm.sliderValue) / 100).toFixed(
        8
      );

      setBuyForm((prev) => ({
        ...prev,
        amount: buyAmount,
      }));
      setSellForm((prev) => ({
        ...prev,
        amount: sellAmount,
      }));
    }
  }, [state.currentPrice.price, activeTab, state.portfolio.balances]);

  // Calculate totals when amount or price changes
  useEffect(() => {
    const amount = Number.parseFloat(buyForm.amount) || 0;
    const price = Number.parseFloat(buyForm.price) || 0;
    setBuyForm((prev) => ({ ...prev, total: (amount * price).toFixed(2) }));
  }, [buyForm.amount, buyForm.price]);

  useEffect(() => {
    const amount = Number.parseFloat(sellForm.amount) || 0;
    const price = Number.parseFloat(sellForm.price) || 0;
    setSellForm((prev) => ({ ...prev, total: (amount * price).toFixed(2) }));
  }, [sellForm.amount, sellForm.price]);

  const handleBuySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = Number.parseFloat(buyForm.amount);
    const price =
      activeTab === "market"
        ? state.currentPrice.price
        : Number.parseFloat(buyForm.price);
    const total = amount * price;

    // Validate form
    if (!amount || amount <= 0) {
      alert(t("error_invalid_amount"));
      return;
    }

    if (activeTab === "limit" && (!price || price <= 0)) {
      alert(t("error_invalid_price"));
      return;
    }

    // Check balance
    const availableBalance = state.portfolio.balances.USDT || 0;
    if (total > availableBalance) {
      alert(
        t("error_insufficient_usdt", {
          amount: availableBalance.toFixed(2),
        })
      );
      return;
    }

    // Place order
    placeOrder({
      symbol: "BTC/USDT",
      side: "buy",
      type: activeTab,
      amount,
      price,
      status: "pending",
    });

    // Reset form
    setBuyForm({
      amount: "",
      price: activeTab === "limit" ? state.currentPrice.price.toFixed(2) : "",
      total: "",
      postOnly: false,
      reduceOnly: false,
      sliderValue: 0,
    });

    // Show success message
    alert(t("success_buy_order", { amount: amount, price: price.toFixed(2) }));
  };

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = Number.parseFloat(sellForm.amount);
    const price =
      activeTab === "market"
        ? state.currentPrice.price
        : Number.parseFloat(sellForm.price);

    // Validate form
    if (!amount || amount <= 0) {
      alert(t("error_invalid_amount"));
      return;
    }

    if (activeTab === "limit" && (!price || price <= 0)) {
      alert(t("error_invalid_price"));
      return;
    }

    // Check balance
    const availableBalance = state.portfolio.balances.BTC || 0;
    if (amount > availableBalance) {
      alert(
        t("error_insufficient_btc", {
          amount: availableBalance.toFixed(8),
        })
      );
      return;
    }

    // Place order
    placeOrder({
      symbol: "BTC/USDT",
      side: "sell",
      type: activeTab,
      amount,
      price,
      status: "pending",
    });

    // Reset form
    setSellForm({
      amount: "",
      price: activeTab === "limit" ? state.currentPrice.price.toFixed(2) : "",
      total: "",
      postOnly: false,
      stopLoss: false,
      sliderValue: 0,
    });

    // Show success message
    alert(t("success_sell_order", { amount: amount, price: price.toFixed(2) }));
  };

  const setMaxBuyAmount = () => {
    const availableBalance = state.portfolio.balances.USDT || 0;
    const price =
      activeTab === "market"
        ? state.currentPrice.price
        : Number.parseFloat(buyForm.price) || state.currentPrice.price;
    const maxAmount = availableBalance / price;
    setBuyForm((prev) => ({ ...prev, amount: maxAmount.toFixed(8) }));
  };

  const setMaxSellAmount = () => {
    const availableBalance = state.portfolio.balances.BTC || 0;
    setSellForm((prev) => ({ ...prev, amount: availableBalance.toFixed(8) }));
  };

  const quickAmounts = [0.25, 0.5, 0.75, 1.0];

  const handleBuySliderChange = (value: number) => {
    const availableBalance = state.portfolio.balances.USDT || 0;
    const price =
      activeTab === "market"
        ? state.currentPrice.price
        : Number.parseFloat(buyForm.price) || state.currentPrice.price;
    const maxAmount = availableBalance / price;
    const newAmount = ((maxAmount * value) / 100).toFixed(8);

    setBuyForm((prev) => ({
      ...prev,
      amount: newAmount,
      sliderValue: value,
    }));
  };

  const handleSellSliderChange = (value: number) => {
    const availableBalance = state.portfolio.balances.BTC || 0;
    const newAmount = ((availableBalance * value) / 100).toFixed(8);

    setSellForm((prev) => ({
      ...prev,
      amount: newAmount,
      sliderValue: value,
    }));
  };

  return (
    <div className={`bg-[#07153b] border-t border-slate-700 ${className}`}>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <span>{t("spot_trading")}</span>
          {state.isConnected && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </h3>

        {/* Order type tabs */}
        <div className="flex space-x-6 mb-4">
          <div className="flex space-x-4 text-sm">
            <button
              onClick={() => setActiveTab("limit")}
              className={`pb-1 transition-colors ${
                activeTab === "limit"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t("limit")}
            </button>
            <button
              onClick={() => setActiveTab("market")}
              className={`pb-1 transition-colors ${
                activeTab === "market"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t("market")}
            </button>
            <span className="text-gray-400">{t("advanced_limit")}</span>
            <span className="text-gray-400">{t("trail_stop")}</span>
            <span className="text-gray-400">{t("trigger")}</span>
            <span className="text-gray-400">{t("tp_sl")}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Buy Section */}
          <form onSubmit={handleBuySubmit} className="space-y-4">
            <div className="text-green-400 font-semibold mb-3">
              {t("buy_btc")}
            </div>

            {/* Available balance */}
            <div className="text-xs text-gray-400">
              {t("available_usdt", {
                amount: (state.portfolio.balances.USDT || 0).toFixed(2),
              })}
            </div>

            {/* Price input (for limit orders) */}
            {activeTab === "limit" && (
              <div className="space-y-2">
                <label className="text-sm text-gray-400">
                  {t("price_usdt")}
                </label>
                <input
                  type="number"
                  value={buyForm.price}
                  onChange={(e) =>
                    setBuyForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded text-sm"
                  placeholder="37,268.00"
                  step="0.01"
                />
              </div>
            )}

            {/* Amount input */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm text-gray-400">
                  {t("amount_btc")}
                </label>
              </div>
              <input
                type="number"
                value={buyForm.amount}
                onChange={(e) =>
                  setBuyForm((prev) => ({
                    ...prev,
                    amount: e.target.value,
                    sliderValue: 0, // Reset slider when manually entering amount
                  }))
                }
                className="w-full bg-slate-700 text-white px-3 py-2 rounded text-sm"
                placeholder="0.00"
                step="0.00000001"
              />
              <Slider
                value={buyForm.sliderValue}
                onChange={handleBuySliderChange}
                className="mt-4"
                type="buy"
              />
            </div>

            {/* Quick amount buttons */}
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((percent) => (
                <button
                  key={percent}
                  type="button"
                  onClick={() => {
                    const availableBalance = state.portfolio.balances.USDT || 0;
                    const price =
                      activeTab === "market"
                        ? state.currentPrice.price
                        : Number.parseFloat(buyForm.price) ||
                          state.currentPrice.price;
                    const amount = (availableBalance * percent) / price;
                    setBuyForm((prev) => ({
                      ...prev,
                      amount: amount.toFixed(8),
                    }));
                  }}
                  className="text-xs py-1 bg-slate-700 text-gray-400 hover:text-white hover:bg-slate-600 rounded"
                >
                  {(percent * 100).toFixed(0)}%
                </button>
              ))}
            </div>

            {/* Total */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">{t("total_usdt")}</label>
              <input
                type="number"
                value={buyForm.total}
                onChange={(e) => {
                  const total = Number.parseFloat(e.target.value) || 0;
                  const price =
                    activeTab === "market"
                      ? state.currentPrice.price
                      : Number.parseFloat(buyForm.price) ||
                        state.currentPrice.price;
                  setBuyForm((prev) => ({
                    ...prev,
                    total: e.target.value,
                    amount: price > 0 ? (total / price).toFixed(8) : "",
                  }));
                }}
                className="w-full bg-slate-700 text-white px-3 py-2 rounded text-sm"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            {/* Order options */}
            <div className="space-y-2 text-xs">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={buyForm.postOnly}
                  onChange={(e) =>
                    setBuyForm((prev) => ({
                      ...prev,
                      postOnly: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <span>{t("post_only")}</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={buyForm.reduceOnly}
                  onChange={(e) =>
                    setBuyForm((prev) => ({
                      ...prev,
                      reduceOnly: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <span>{t("reduce_only")}</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              {t("buy_button")}
            </button>
          </form>

          {/* Sell Section */}
          <form onSubmit={handleSellSubmit} className="space-y-4">
            <div className="text-red-400 font-semibold mb-3">
              {t("sell_btc")}
            </div>

            {/* Available balance */}
            <div className="text-xs text-gray-400">
              {t("available_btc", {
                amount: (state.portfolio.balances.BTC || 0).toFixed(8),
              })}
            </div>

            {/* Price input (for limit orders) */}
            {activeTab === "limit" && (
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Price (USDT)</label>
                <input
                  type="number"
                  value={sellForm.price}
                  onChange={(e) =>
                    setSellForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded text-sm"
                  placeholder="37,268.00"
                  step="0.01"
                />
              </div>
            )}

            {/* Amount input */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm text-gray-400">Amount (BTC)</label>
              </div>
              <input
                type="number"
                value={sellForm.amount}
                onChange={(e) =>
                  setSellForm((prev) => ({
                    ...prev,
                    amount: e.target.value,
                    sliderValue: 0, // Reset slider when manually entering amount
                  }))
                }
                className="w-full bg-slate-700 text-white px-3 py-2 rounded text-sm"
                placeholder="0.00"
                step="0.00000001"
              />
              <Slider
                value={sellForm.sliderValue}
                onChange={handleSellSliderChange}
                className="mt-4"
                type="sell"
              />
            </div>

            {/* Quick amount buttons */}
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((percent) => (
                <button
                  key={percent}
                  type="button"
                  onClick={() => {
                    const availableBalance = state.portfolio.balances.BTC || 0;
                    const amount = availableBalance * percent;
                    setSellForm((prev) => ({
                      ...prev,
                      amount: amount.toFixed(8),
                    }));
                  }}
                  className="text-xs py-1 bg-slate-700 text-gray-400 hover:text-white hover:bg-slate-600 rounded"
                >
                  {(percent * 100).toFixed(0)}%
                </button>
              ))}
            </div>

            {/* Total */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Total (USDT)</label>
              <input
                type="number"
                value={sellForm.total}
                onChange={(e) => {
                  const total = Number.parseFloat(e.target.value) || 0;
                  const price =
                    activeTab === "market"
                      ? state.currentPrice.price
                      : Number.parseFloat(sellForm.price) ||
                        state.currentPrice.price;
                  setSellForm((prev) => ({
                    ...prev,
                    total: e.target.value,
                    amount: price > 0 ? (total / price).toFixed(8) : "",
                  }));
                }}
                className="w-full bg-slate-700 text-white px-3 py-2 rounded text-sm"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            {/* Order options */}
            <div className="space-y-2 text-xs">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={sellForm.postOnly}
                  onChange={(e) =>
                    setSellForm((prev) => ({
                      ...prev,
                      postOnly: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <span>Post-Only</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={sellForm.stopLoss}
                  onChange={(e) =>
                    setSellForm((prev) => ({
                      ...prev,
                      stopLoss: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <span>Stop Loss</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Sell BTC
            </button>
          </form>
        </div>

        {/* Trading fees info */}
        <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Trading Fee:</span>
            <span>0.1%</span>
          </div>
          <div className="flex justify-between">
            <span>Est. Total:</span>
            <span>
              {activeTab === "market"
                ? `≈ ${(
                    Number.parseFloat(buyForm.amount) *
                    state.currentPrice.price *
                    1.001
                  ).toFixed(2)} USDT`
                : `≈ ${(Number.parseFloat(buyForm.total) * 1.001).toFixed(
                    2
                  )} USDT`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingForm;
