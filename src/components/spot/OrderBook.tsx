import { useTrading } from "@/context/TradingContext";
import type React from "react";
import { useState } from "react";

interface OrderBookProps {
  className?: string;
}

const OrderBook: React.FC<OrderBookProps> = ({ className = "" }) => {
  const { state } = useTrading();
  const [activeTab, setActiveTab] = useState<"book" | "trades">("book");
  const [depthMode, setDepthMode] = useState<"spread" | "all">("spread");

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toFixed(3);
  };

  const formatPercent = (percent: number) => {
    return percent.toFixed(2) + "%";
  };

  // Calculate depth percentages for visualization
  const calculateDepthPercent = (total: number, maxTotal: number) => {
    return (total / maxTotal) * 100;
  };

  const maxAskTotal = Math.max(...state.orderBook.asks.map((ask) => ask.total));
  const maxBidTotal = Math.max(...state.orderBook.bids.map((bid) => bid.total));
  const maxTotal = Math.max(maxAskTotal, maxBidTotal);

  const spread =
    state.orderBook.asks[0]?.price - state.orderBook.bids[0]?.price;
  const spreadPercent = spread ? (spread / state.currentPrice.price) * 100 : 0;

  return (
    <div className={`bg-[#07153b] ${className}`}>
      {/* Header with tabs */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setActiveTab("book")}
            className={`pb-1 text-sm font-medium transition-colors ${
              activeTab === "book"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Order Book
          </button>
          <button
            onClick={() => setActiveTab("trades")}
            className={`pb-1 text-sm font-medium transition-colors ${
              activeTab === "trades"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Last Trades
          </button>
        </div>

        {/* Connection status */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            {state.isConnected ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400">Real-time</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-red-400">Disconnected</span>
              </>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() =>
                setDepthMode(depthMode === "spread" ? "all" : "spread")
              }
              className="text-gray-400 hover:text-white"
            >
              {depthMode === "spread" ? "📊" : "📈"}
            </button>
          </div>
        </div>
      </div>

      {activeTab === "book" ? (
        <div className="p-4">
          {/* Column headers */}
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mb-3">
            <span>Price (USDT)</span>
            <span className="text-right">Amount (BTC)</span>
            <span className="text-right">Total</span>
          </div>

          {/* Asks (Sell orders) - Red */}
          <div className="space-y-1 mb-4">
            <div className="text-xs text-gray-400 mb-2 flex justify-between">
              <span>Asks ({state.orderBook.asks.length})</span>
              <span className="text-red-400">Selling pressure</span>
            </div>
            {state.orderBook.asks
              .slice(0, 10)
              .reverse()
              .map((ask, i) => {
                const depthPercent = calculateDepthPercent(ask.total, maxTotal);
                return (
                  <div
                    key={`ask-${ask.price}-${i}`}
                    className="grid grid-cols-3 gap-2 py-1 text-xs relative group hover:bg-slate-700/50 cursor-pointer"
                  >
                    {/* Depth visualization background */}
                    <div
                      className="absolute inset-0 bg-red-500/10"
                      style={{ width: `${depthPercent}%` }}
                    />
                    <div className="relative">
                      <span className="text-red-400 font-mono">
                        {formatPrice(ask.price)}
                      </span>
                    </div>
                    <div className="relative text-right">
                      <span className="text-white font-mono">
                        {formatAmount(ask.amount)}
                      </span>
                    </div>
                    <div className="relative text-right">
                      <span className="text-gray-400 font-mono">
                        {formatPercent(ask.total)}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Current Price */}
          <div className="my-4 text-center border-y border-slate-700 py-3">
            <div className="text-lg font-bold font-mono">
              {formatPrice(state.currentPrice.price)}
            </div>
            <div className="text-sm text-gray-400">
              ≈ ${formatPrice(state.currentPrice.price)}
            </div>
            <div className="text-xs mt-1">
              <span className="text-gray-400">Spread: </span>
              <span
                className={
                  spreadPercent > 0.1 ? "text-red-400" : "text-green-400"
                }
              >
                {formatPrice(spread)} ({spreadPercent.toFixed(3)}%)
              </span>
            </div>
          </div>

          {/* Bids (Buy orders) - Green */}
          <div className="space-y-1">
            <div className="text-xs text-gray-400 mb-2 flex justify-between">
              <span>Bids ({state.orderBook.bids.length})</span>
              <span className="text-green-400">Buying pressure</span>
            </div>
            {state.orderBook.bids.slice(0, 15).map((bid, i) => {
              const depthPercent = calculateDepthPercent(bid.total, maxTotal);
              return (
                <div
                  key={`bid-${bid.price}-${i}`}
                  className="grid grid-cols-3 gap-2 py-1 text-xs relative group hover:bg-slate-700/50 cursor-pointer"
                >
                  {/* Depth visualization background */}
                  <div
                    className="absolute inset-0 bg-green-500/10"
                    style={{ width: `${depthPercent}%` }}
                  />
                  <div className="relative">
                    <span className="text-green-400 font-mono">
                      {formatPrice(bid.price)}
                    </span>
                  </div>
                  <div className="relative text-right">
                    <span className="text-white font-mono">
                      {formatAmount(bid.amount)}
                    </span>
                  </div>
                  <div className="relative text-right">
                    <span className="text-gray-400 font-mono">
                      {formatPercent(bid.total)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order book summary */}
          <div className="mt-4 pt-4 border-t border-slate-700 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-400">Bid Volume</div>
                <div className="text-green-400 font-mono">
                  {state.orderBook.bids
                    .reduce((sum, bid) => sum + bid.amount, 0)
                    .toFixed(3)}{" "}
                  BTC
                </div>
              </div>
              <div>
                <div className="text-gray-400">Ask Volume</div>
                <div className="text-red-400 font-mono">
                  {state.orderBook.asks
                    .reduce((sum, ask) => sum + ask.amount, 0)
                    .toFixed(3)}{" "}
                  BTC
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Last Trades Tab */
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mb-3">
            <span>Price (USDT)</span>
            <span className="text-right">Amount (BTC)</span>
            <span className="text-right">Time</span>
          </div>

          <div className="space-y-1">
            {state.transactions.slice(0, 20).map((transaction) => (
              <div
                key={transaction.id}
                className="grid grid-cols-3 gap-2 py-1 text-xs hover:bg-slate-700/50"
              >
                <div>
                  <span
                    className={
                      transaction.side === "buy"
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {formatPrice(transaction.price)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-white font-mono">
                    {formatAmount(transaction.amount)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400">
                    {new Date(transaction.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {state.transactions.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No recent trades
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderBook;
