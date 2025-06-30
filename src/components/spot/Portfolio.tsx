import type React from "react";
import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { useTrading } from "@/context/TradingContext";
import { useTranslations } from "next-intl";
interface PortfolioProps {
  className?: string;
}

const Portfolio: React.FC<PortfolioProps> = ({ className = "" }) => {
  const { state, cancelOrder } = useTrading();
  const t = useTranslations("spot.portfolio");
  const [activeTab, setActiveTab] = useState<"orders" | "history" | "balances">(
    "orders"
  );

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toFixed(8);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getOrderTypeColor = (side: "buy" | "sell") => {
    return side === "buy" ? "text-green-400" : "text-red-400";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "filled":
        return "text-green-400";
      case "cancelled":
        return "text-red-400";
      case "pending":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      cancelOrder(orderId);
    }
  };

  const totalPortfolioValue = Object.entries(state.portfolio.balances).reduce(
    (total, [symbol, balance]) => {
      if (symbol === "USDT") return total + balance;
      if (symbol === "BTC") return total + balance * state.currentPrice.price;
      // For other currencies, use approximate values
      const approximatePrice =
        symbol === "ETH" ? 2500 : symbol === "BNB" ? 300 : 1;
      return total + balance * approximatePrice;
    },
    0
  );

  return (
    <div className={`bg-[#07153b] border-t border-slate-700 ${className}`}>
      <div className="p-4">
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-2 text-sm font-medium transition-colors ${
              activeTab === "orders"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {t("tabs.orders")} ({state.openOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-2 text-sm font-medium transition-colors ${
              activeTab === "history"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {t("tabs.history")} ({state.orderHistory.length})
          </button>
          <button
            onClick={() => setActiveTab("balances")}
            className={`pb-2 text-sm font-medium transition-colors ${
              activeTab === "balances"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {t("tabs.balances")}
          </button>
        </div>

        {/* Open Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {state.openOrders.length > 0 ? (
              <div className="space-y-2">
                {/* Headers */}
                <div className="grid grid-cols-7 gap-4 text-xs text-gray-400 pb-2 border-b border-slate-700">
                  <span>{t("orders.headers.pair")}</span>
                  <span>{t("orders.headers.type")}</span>
                  <span>{t("orders.headers.side")}</span>
                  <span className="text-right">
                    {t("orders.headers.amount")}
                  </span>
                  <span className="text-right">
                    {t("orders.headers.price")}
                  </span>
                  <span className="text-right">
                    {t("orders.headers.total")}
                  </span>
                  <span className="text-right">
                    {t("orders.headers.action")}
                  </span>
                </div>

                {/* Order rows */}
                {state.openOrders.map((order) => (
                  <div
                    key={order.id}
                    className="grid grid-cols-7 gap-4 text-sm py-3 hover:bg-slate-700/50 rounded"
                  >
                    <div className="font-mono">{order.symbol}</div>
                    <div className="capitalize">{order.type}</div>
                    <div className={getOrderTypeColor(order.side)}>
                      {order.side.toUpperCase()}
                    </div>
                    <div className="text-right font-mono">
                      {formatAmount(order.amount)}
                    </div>
                    <div className="text-right font-mono">
                      {formatPrice(order.price)}
                    </div>
                    <div className="text-right font-mono">
                      {formatPrice(order.amount * order.price)}
                    </div>
                    <div className="text-right">
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Cancel Order"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#07153b] rounded-lg mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded" />
                </div>
                <div className="text-gray-400">{t("orders.noOrders")}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {t("orders.placePrompt")}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Order History Tab */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {state.orderHistory.length > 0 || state.transactions.length > 0 ? (
              <div className="space-y-2">
                {/* Headers */}
                <div className="grid grid-cols-7 gap-4 text-xs text-gray-400 pb-2 border-b border-slate-700">
                  <span>{t("orders.headers.date")}</span>
                  <span>{t("orders.headers.pair")}</span>
                  <span>{t("orders.headers.type")}</span>
                  <span>{t("orders.headers.side")}</span>
                  <span className="text-right">
                    {t("orders.headers.amount")}
                  </span>
                  <span className="text-right">
                    {t("orders.headers.price")}
                  </span>
                  <span className="text-right">
                    {t("orders.headers.status")}
                  </span>
                </div>

                {/* Combine order history and transactions */}
                {[
                  ...state.orderHistory,
                  ...state.transactions.map((tx) => ({
                    id: tx.id,
                    symbol: tx.symbol,
                    side: tx.side,
                    type: "market" as const,
                    amount: tx.amount,
                    price: tx.price,
                    status: "filled" as const,
                    timestamp: tx.timestamp,
                  })),
                ]
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .slice(0, 20)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-7 gap-4 text-sm py-3 hover:bg-slate-700/50 rounded"
                    >
                      <div className="text-gray-400 text-xs">
                        {formatDate(item.timestamp)}
                      </div>
                      <div className="font-mono">{item.symbol}</div>
                      <div className="capitalize">{item.type}</div>
                      <div className={getOrderTypeColor(item.side)}>
                        {item.side.toUpperCase()}
                      </div>
                      <div className="text-right font-mono">
                        {formatAmount(item.amount)}
                      </div>
                      <div className="text-right font-mono">
                        {formatPrice(item.price)}
                      </div>
                      <div
                        className={`text-right capitalize ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700 rounded-lg mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded" />
                </div>
                <div className="text-gray-400">{t("history.noHistory")}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {t("history.historyPrompt")}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Portfolio/Balances Tab */}
        {activeTab === "balances" && (
          <div className="space-y-6">
            {/* Portfolio Summary */}
            <div className="bg-[#07153b] rounded-lg p-4">
              <h4 className="text-lg font-semibold mb-4">
                {t("balances.summary.title")}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-400">
                    {t("balances.summary.total")}
                  </div>
                  <div className="text-xl font-bold text-green-400">
                    ${formatPrice(totalPortfolioValue)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">
                    {t("balances.summary.pnl")}
                  </div>
                  <div className="text-xl font-bold text-green-400">
                    +${formatPrice(totalPortfolioValue * 0.025)}
                  </div>
                  <div className="text-sm text-green-400">+2.5%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">
                    {t("balances.summary.available")}
                  </div>
                  <div className="text-lg font-semibold">
                    ${formatPrice(state.portfolio.balances.USDT || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">
                    {t("balances.summary.inOrders")}
                  </div>
                  <div className="text-lg font-semibold">
                    $
                    {formatPrice(
                      state.openOrders.reduce(
                        (sum, order) => sum + order.amount * order.price,
                        0
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Balances */}
            <div>
              <h4 className="text-lg font-semibold mb-4">
                {t("balances.assets.title")}
              </h4>
              <div className="space-y-3">
                {/* Headers */}
                <div className="grid grid-cols-4 gap-4 text-xs text-gray-400 pb-2 border-b border-slate-700">
                  <span>{t("balances.assets.headers.asset")}</span>
                  <span className="text-right">
                    {t("balances.assets.headers.balance")}
                  </span>
                  <span className="text-right">
                    {t("balances.assets.headers.value")}
                  </span>
                  <span className="text-right">
                    {t("balances.assets.headers.allocation")}
                  </span>
                </div>

                {/* Balance rows */}
                {Object.entries(state.portfolio.balances)
                  .filter(([_, balance]) => balance > 0)
                  .map(([symbol, balance]) => {
                    const price =
                      symbol === "USDT"
                        ? 1
                        : symbol === "BTC"
                        ? state.currentPrice.price
                        : symbol === "ETH"
                        ? 2500
                        : symbol === "BNB"
                        ? 300
                        : 1;
                    const value = balance * price;
                    const allocation = (value / totalPortfolioValue) * 100;

                    return (
                      <div
                        key={symbol}
                        className="grid grid-cols-4 gap-4 text-sm py-3 hover:bg-slate-700/50 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-xs font-bold">
                            {symbol === "BTC"
                              ? "₿"
                              : symbol === "ETH"
                              ? "Ξ"
                              : symbol.charAt(0)}
                          </div>
                          <span className="font-semibold">{symbol}</span>
                        </div>
                        <div className="text-right font-mono">
                          {symbol === "USDT"
                            ? formatPrice(balance)
                            : formatAmount(balance)}
                        </div>
                        <div className="text-right font-mono">
                          {formatPrice(value)}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <div className="w-12 bg-slate-600 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(allocation, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs">
                              {allocation.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Recent Transactions */}
            {state.transactions.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-4">
                  {t("balances.transactions.title")}
                </h4>
                <div className="space-y-2">
                  {state.transactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.side === "buy"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {transaction.side === "buy" ? "↗" : "↙"}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {transaction.side.toUpperCase()}{" "}
                            {transaction.symbol}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatDate(transaction.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono">
                          {formatAmount(transaction.amount)} BTC
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          @ {formatPrice(transaction.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
