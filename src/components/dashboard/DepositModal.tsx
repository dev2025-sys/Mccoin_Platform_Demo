"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, AlertTriangle, Clock, Minus } from "lucide-react";
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import { SiSolana, SiTether } from "react-icons/si";
import { useBalanceManager } from "@/lib/balance-manager";
import toast from "react-hot-toast";
import Link from "next/link";

// Helper functions (copied from balance-manager.ts)
function generateBalanceHistory(baseBalance: number) {
  const now = Date.now();
  return Array.from({ length: 50 }, (_, i) => ({
    time: now - ((50 - i) * 60 * 60 * 1000) / 2,
    value:
      baseBalance +
      Math.sin(i / 3) * (baseBalance * 0.1) +
      Math.cos(i / 1.5) * (baseBalance * 0.05) +
      (Math.random() - 0.5) * (baseBalance * 0.02) +
      (i % 7 === 0 ? (Math.random() - 0.5) * (baseBalance * 0.08) : 0),
  }));
}

function generateTxId(): string {
  return (
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10)
  ).toUpperCase();
}

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountType: "trading" | "funding";
}

interface CoinData {
  symbol: string;
  name: string;
  icon: React.ReactNode;
  networks: NetworkData[];
  minDeposit: number;
}

interface NetworkData {
  name: string;
  arrivalTime: string;
  minDeposit: number;
  depositAddress: string;
}

const COINS: Record<string, CoinData> = {
  BTC: {
    symbol: "BTC",
    name: "Bitcoin",
    icon: <FaBitcoin className="w-5 h-5 text-[#F7931A]" />,
    networks: [
      {
        name: "Bitcoin Network",
        arrivalTime: "2-3 confirmations",
        minDeposit: 0.001,
        depositAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      },
    ],
    minDeposit: 0.001,
  },
  USDT: {
    symbol: "USDT",
    name: "Tether",
    icon: <SiTether className="w-5 h-5 text-[#26A17B]" />,
    networks: [
      {
        name: "Ethereum (ERC20)",
        arrivalTime: "12-15 confirmations",
        minDeposit: 1,
        depositAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      },
      {
        name: "Tron (TRC20)",
        arrivalTime: "20 confirmations",
        minDeposit: 1,
        depositAddress: "TQn9Y2khDD95J42FQtQTdw6S5vLzqJqKpS",
      },
      {
        name: "BSC (BEP20)",
        arrivalTime: "15 confirmations",
        minDeposit: 1,
        depositAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      },
    ],
    minDeposit: 1,
  },
  SOL: {
    symbol: "SOL",
    name: "Solana",
    icon: <SiSolana className="w-5 h-5 text-[#14F195]" />,
    networks: [
      {
        name: "Solana Network",
        arrivalTime: "32 confirmations",
        minDeposit: 0.1,
        depositAddress: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
      },
    ],
    minDeposit: 0.1,
  },
};

export default function DepositModal({
  isOpen,
  onClose,
  accountType,
}: DepositModalProps) {
  const { balances, updateTradingBalance, updateFundingBalance } =
    useBalanceManager();
  const [selectedCoin, setSelectedCoin] = useState<string>("");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [depositAmount, setDepositAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedCoin("");
      setSelectedNetwork("");
      setDepositAmount("");
    }
  }, [isOpen]);

  // Get available balance for selected coin (account-specific)
  const getAvailableBalance = () => {
    if (!selectedCoin) return 0;

    // Use only the specific account balance
    const accountBalance = balances[accountType].totalBalanceUSDT;

    if (selectedCoin === "USDT") {
      return accountBalance;
    } else if (selectedCoin === "BTC") {
      // Convert USDT to BTC (assuming 1 BTC = 65000 USDT)
      return accountBalance / 65000;
    } else if (selectedCoin === "SOL") {
      // Convert USDT to SOL (assuming 1 SOL = 100 USDT)
      return accountBalance / 100;
    }

    return 0;
  };

  // Get selected network data
  const getSelectedNetworkData = () => {
    if (!selectedCoin || !selectedNetwork) return null;
    return COINS[selectedCoin]?.networks.find(
      (network) => network.name === selectedNetwork
    );
  };

  // Handle deposit
  const handleDeposit = async () => {
    if (!selectedCoin || !selectedNetwork || !depositAmount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amountNum = parseFloat(depositAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid deposit amount");
      return;
    }

    // Check minimum deposit requirement
    const minDeposit = COINS[selectedCoin]?.minDeposit || 0;
    if (amountNum < minDeposit) {
      toast.error(`Minimum deposit is ${minDeposit} ${selectedCoin}`);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Use the entered deposit amount
      const depositAmountUSDT =
        selectedCoin === "USDT"
          ? amountNum
          : selectedCoin === "BTC"
          ? amountNum * 65000
          : amountNum * 100;

      const newBalance =
        balances[accountType].totalBalanceUSDT + depositAmountUSDT;

      // Update the specific account with new balance, history, and transaction
      if (accountType === "trading") {
        updateTradingBalance({
          totalBalanceUSDT: newBalance,
          balanceHistory: generateBalanceHistory(newBalance),
          txs: [
            {
              date: new Date().toLocaleString("en-US", {
                day: "2-digit",
                month: "short",
              }),
              action: "Deposit",
              amount: amountNum.toFixed(6),
              symbol: selectedCoin,
              txId: generateTxId(),
            },
            ...balances.trading.txs,
          ].slice(0, 10),
        });
      } else {
        updateFundingBalance({
          totalBalanceUSDT: newBalance,
          balanceHistory: generateBalanceHistory(newBalance),
          txs: [
            {
              date: new Date().toLocaleString("en-US", {
                day: "2-digit",
                month: "short",
              }),
              action: "Deposit",
              amount: amountNum.toFixed(6),
              symbol: selectedCoin,
              txId: generateTxId(),
            },
            ...balances.funding.txs,
          ].slice(0, 10),
        });
      }

      toast.success(
        `Deposit of ${amountNum.toFixed(
          6
        )} ${selectedCoin} completed! Balance updated.`
      );
      onClose();
    } catch (error) {
      toast.error("Deposit failed");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedNetworkData = getSelectedNetworkData();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isLoading) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto max-h-[90vh] overflow-y-auto"
          >
            <Card className="bg-[#081935] border-[#22304A] shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-4 sm:px-6">
                <CardTitle className="text-lg sm:text-xl font-bold text-white">
                  Deposit {accountType === "trading" ? "Trading" : "Funding"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={isLoading}
                  className="text-white/60 hover:text-white hover:bg-white/10 p-2"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
                {/* Coin Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Coin</label>
                  <Select value={selectedCoin} onValueChange={setSelectedCoin}>
                    <SelectTrigger className="bg-[#0c1e4e] border-[#22304A] text-white w-full h-10 sm:h-11">
                      <SelectValue
                        placeholder="Select coin"
                        className="text-white"
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-[#081935] border-[#22304A]">
                      {Object.values(COINS).map((coin) => (
                        <SelectItem
                          key={coin.symbol}
                          value={coin.symbol}
                          className="text-white hover:bg-[#0c1e4e]"
                        >
                          <div className="flex items-center gap-2">
                            {coin.icon}
                            <span>{coin.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Available balance text */}
                  {selectedCoin && (
                    <div className="text-xs sm:text-sm text-white/60 mt-1">
                      Available balance: {getAvailableBalance().toFixed(6)}{" "}
                      {selectedCoin}
                    </div>
                  )}
                </div>

                {/* Amount Input */}
                {selectedCoin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">
                      Amount to Deposit
                    </label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="min 0.001"
                      min={COINS[selectedCoin]?.minDeposit || 0.001}
                      step="0.000001"
                      className="w-full bg-[#0c1e4e] border-[#22304A] text-white px-3 py-2 rounded-md h-10 sm:h-11 text-sm"
                    />
                    <div className="text-xs text-white/60">
                      Minimum deposit:{" "}
                      {COINS[selectedCoin]?.minDeposit || 0.001} {selectedCoin}
                    </div>
                  </div>
                )}

                {/* Network Selection */}
                {selectedCoin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">
                      Select Network
                    </label>
                    <Select
                      value={selectedNetwork}
                      onValueChange={setSelectedNetwork}
                    >
                      <SelectTrigger className="bg-[#0c1e4e] border-[#22304A] text-white w-full h-10 sm:h-11">
                        <SelectValue placeholder="Select network" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#081935] border-[#22304A]">
                        {COINS[selectedCoin]?.networks.map((network) => (
                          <SelectItem
                            key={network.name}
                            value={network.name}
                            className="text-white hover:bg-[#0c1e4e]"
                          >
                            {network.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Warning Card */}
                {selectedCoin && (
                  <Card className="bg-yellow-500/10 border-yellow-500/20">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div className="text-xs sm:text-sm text-yellow-400">
                          Make sure you select the deposit network that
                          corresponds to the withdrawal platform. Failure to do
                          so may result in the loss of your funds.{" "}
                          <Link
                            href="#"
                            className="text-yellow-300 hover:text-yellow-200 underline"
                            onClick={(e) => {
                              e.preventDefault();
                              toast.success(
                                "Learn more about deposit networks"
                              );
                            }}
                          >
                            Learn how to select Deposit network
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Summary Card */}
                {selectedNetworkData && (
                  <Card className="bg-[#0c1e4e] border-[#22304A]">
                    <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                      <div className="text-sm font-medium text-white/80 mb-3">
                        Deposit Summary
                      </div>

                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">Network:</span>
                          <span className="text-white font-medium">
                            {selectedNetworkData.name}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-white/60 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Arrival time:
                          </span>
                          <span className="text-white">
                            {selectedNetworkData.arrivalTime}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-white/60 flex items-center gap-1">
                            <Minus className="w-3 h-3" />
                            Min deposit:
                          </span>
                          <span className="text-white">
                            {selectedNetworkData.minDeposit} {selectedCoin}
                          </span>
                        </div>
                      </div>

                      {/* Deposit Address */}
                      <div className="mt-4 p-3 bg-[#081935] rounded-lg border border-[#22304A]">
                        <div className="text-xs text-white/60 mb-1">
                          Deposit Address:
                        </div>
                        <div className="text-xs sm:text-sm font-mono text-white break-all">
                          {selectedNetworkData.depositAddress}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Deposit Button */}
                <Button
                  onClick={handleDeposit}
                  disabled={
                    !selectedCoin ||
                    !selectedNetwork ||
                    !depositAmount ||
                    isLoading
                  }
                  className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white h-11 sm:h-12 text-sm sm:text-base font-medium"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="hidden sm:inline">Processing...</span>
                      <span className="sm:hidden">Processing</span>
                    </div>
                  ) : (
                    "Deposit"
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
