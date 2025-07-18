"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import { SiSolana, SiTether } from "react-icons/si";
import {
  DollarSign,
  PieChart,
  TrendingUp,
  TrendingDown,
  CopyIcon,
  ArrowUpDown,
  Plus,
  Minus,
  ShoppingCart,
  X,
} from "lucide-react";
import { Chart, registerables } from "chart.js";
import { useBalanceManager } from "@/lib/balance-manager";
import { BuyCryptoModal } from "@/components/dashboard/BuyCryptoModal";
import DepositModal from "@/components/dashboard/DepositModal";
import WithdrawModal from "@/components/dashboard/WithdrawModal";

if (typeof window !== "undefined") {
  Chart.register(...registerables);
}

const CURRENCIES = ["USD", "AED", "GBP", "EUR", "CAD"];
const COINS = [
  { symbol: "BTC", icon: <FaBitcoin className="text-yellow-400" /> },
  { symbol: "ETH", icon: <FaEthereum className="text-indigo-400" /> },
  { symbol: "SOL", icon: <SiSolana className="text-green-400" /> },
];
// Static fallback rates
const FALLBACK_EXCHANGE_RATES = {
  USDT: { USD: 1, AED: 3.67, GBP: 0.78, EUR: 0.92, CAD: 1.36 },
  BTC: { USD: 65000, AED: 238000, GBP: 51000, EUR: 60000, CAD: 88000 },
};

function getRandomTxId() {
  return (
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10)
  ).toUpperCase();
}

function getRandomAmount(symbol: string) {
  if (symbol === "BTC") return (Math.random() * 0.1 + 0.01).toFixed(5);
  if (symbol === "ETH") return (Math.random() * 1 + 0.1).toFixed(4);
  if (symbol === "SOL") return (Math.random() * 10 + 1).toFixed(2);
  return (Math.random() * 100 + 10).toFixed(2);
}

function generateDummyData() {
  const totalBalanceUSDT = 12345.67;
  const now = Date.now();

  // More volatile balance history with bigger swings
  const balanceHistory = Array.from({ length: 50 }, (_, i) => ({
    time: now - ((50 - i) * 60 * 60 * 1000) / 2,
    value:
      10000 +
      Math.sin(i / 3) * 3000 + // Bigger sine wave with different frequency
      Math.cos(i / 1.5) * 2000 + // Higher frequency cosine
      (Math.random() - 0.5) * 1200 + // Bigger random fluctuations
      (i % 7 === 0 ? (Math.random() - 0.5) * 4000 : 0) + // Random spikes/drops
      (i % 12 === 0 ? (Math.random() > 0.5 ? 2500 : -2500) : 0), // Occasional big moves
  }));

  const profit = 3200;
  const loss = 800;
  const actions = ["Deposit", "Withdraw", "Trade"];

  const txs = Array.from({ length: 8 }, () => {
    const coin = COINS[Math.floor(Math.random() * COINS.length)];
    const randomDate = new Date(
      Date.now() - Math.random() * 24 * 60 * 60 * 1000 * 7
    ); // Last 7 days

    return {
      date: formatDateToDDMMM(randomDate), // Formatted as "DD MMM"
      action: actions[Math.floor(Math.random() * actions.length)],
      amount: getRandomAmount(coin.symbol),
      symbol: coin.symbol,
      txId: getRandomTxId(),
    };
  });

  return { totalBalanceUSDT, balanceHistory, profit, loss, txs };
}

function formatDateToDDMMM(date: any) {
  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
  });
}

type BalanceHistoryPoint = { time: number; value: number };
type Tx = {
  date: string;
  action: string;
  amount: string;
  symbol: string;
  txId: string;
};
type OverviewData = {
  totalBalanceUSDT: number;
  balanceHistory: BalanceHistoryPoint[];
  profit: number;
  loss: number;
  txs: Tx[];
};

export default function OverviewTab() {
  const { balances, transferBetweenAccounts, addTransaction } =
    useBalanceManager();
  const data = balances.overview;

  // Live exchange rates state
  const [exchangeRates, setExchangeRates] = useState(FALLBACK_EXCHANGE_RATES);
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  // Modal states
  const buyModalRef = useRef<HTMLDivElement>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Transfer modal states
  const [transferAmount, setTransferAmount] = useState("");
  const [fromAccount, setFromAccount] = useState<"trading" | "funding">(
    "funding"
  );
  const [toAccount, setToAccount] = useState<"trading" | "funding">("trading");
  const [selectedCoin, setSelectedCoin] = useState<"USDT" | "BTC">("USDT");
  const [isTransferring, setIsTransferring] = useState(false);
  const [showToast, setShowToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // Fetch live exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      setIsLoadingRates(true);
      try {
        const response = await fetch("/api/exchange-rates");
        if (response.ok) {
          const rates = await response.json();
          setExchangeRates(rates);
        }
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
      } finally {
        setIsLoadingRates(false);
      }
    };

    fetchExchangeRates();
    // Refresh rates every 30 seconds
    const interval = setInterval(fetchExchangeRates, 30000);
    return () => clearInterval(interval);
  }, []);

  const [showBTC, setShowBTC] = useState(false);
  const [fiat, setFiat] =
    useState<keyof (typeof FALLBACK_EXCHANGE_RATES)["BTC"]>("USD");

  const balanceBTC = useMemo(
    () => data.totalBalanceUSDT / exchangeRates.BTC.USD,
    [data.totalBalanceUSDT, exchangeRates]
  );
  const balanceFiat = useMemo(
    () => data.totalBalanceUSDT * exchangeRates.USDT[fiat],
    [data.totalBalanceUSDT, fiat, exchangeRates]
  );

  const lineChartData = useMemo(
    () => ({
      labels: data.balanceHistory.map((p) => formatToHHMM(new Date(p.time))),
      datasets: [
        {
          label: "Balance",
          data: data.balanceHistory.map((p) => p.value),
          borderColor: "#EC3B3B",
          backgroundColor: "rgba(236,59,59,0.1)",
          tension: 0.4,
          pointRadius: 0,
          fill: true,
        },
      ],
    }),
    [data.balanceHistory]
  );

  // Handle transfer function
  const handleTransfer = async () => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) return;

    // Validation: Check if accounts are different
    if (fromAccount === toAccount) {
      setShowToast({
        show: true,
        message: "Cannot transfer to the same account",
        type: "error",
      });
      return;
    }

    // Validation: Check sufficient balance
    const sourceBalance = balances[fromAccount].totalBalanceUSDT;
    const requiredAmount =
      selectedCoin === "USDT" ? amount : amount * exchangeRates.BTC.USD;

    if (sourceBalance < requiredAmount) {
      setShowToast({
        show: true,
        message: "Insufficient balance",
        type: "error",
      });
      return;
    }

    setIsTransferring(true);

    try {
      // 3-second delay to simulate processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      transferBetweenAccounts(fromAccount, toAccount, requiredAmount);
      setShowToast({
        show: true,
        message: `Transfer of ${amount} ${selectedCoin} successful`,
        type: "success",
      });
      setShowTransferModal(false);
      setTransferAmount("");
    } catch (error) {
      setShowToast({
        show: true,
        message: "Transfer failed",
        type: "error",
      });
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="text-[#DAE6EA]"
    >
      <div className="mb-8">
        <p className="text-lg opacity-80 md:text-left text-center">
          Your balances, performance, and recent activity at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Total Balance Card */}
        <Card className="bg-[#081935] border-[#22304A] shadow-2xl rounded-xl hover:shadow-[0_10px_30px_-5px_rgba(34,48,74,0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-[#2d3f6e]">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg text-white/90 italic">
                Total Balance
              </span>
              <div className="flex items-center gap-2 bg-[#0c1e4e]/50 rounded-full px-2 py-1 border border-[#22304A]">
                <span className="text-xs text-white/80">USDT</span>
                <Switch
                  checked={showBTC}
                  onCheckedChange={setShowBTC}
                  className="data-[state=checked]:bg-[#3b82f6] data-[state=unchecked]:bg-[#22304A]"
                />
                <span className="text-xs text-white/80">BTC</span>
              </div>
            </div>

            <motion.div
              key={data.totalBalanceUSDT}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.3 }}
              className="text-4xl font-bold flex items-end gap-2 text-white"
            >
              {showBTC
                ? balanceBTC.toLocaleString(undefined, {
                    maximumFractionDigits: 5,
                  })
                : data.totalBalanceUSDT.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
              <span className="text-lg font-semibold text-[#3b82f6]">
                {showBTC ? "BTC" : "USDT"}
              </span>
            </motion.div>

            <div className="text-sm flex items-center gap-2 text-white/80">
              <span className="text-white/60">≈</span>
              <span className="font-medium">
                {balanceFiat.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </span>
              <Select
                value={fiat}
                onValueChange={(value: string) => setFiat(value as typeof fiat)}
              >
                <SelectTrigger className="w-20 h-6 border-none bg-transparent text-white/80 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0c1e4e] border-[#22304A]">
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c} className="text-white/80">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 border border-red-500 px-2 animate-pulse rounded-xl">
                <span>Live</span>
                <div className="w-2 h-2 bg-green-400 rounded-full" />
              </div>
            </div>

            {/* Balance Breakdown */}
            <div className="border-t border-[#22304A] pt-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Trading Account:</span>
                <span className="text-white/90 font-medium">
                  {balances.trading.totalBalanceUSDT.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
                  USDT
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Funding Account:</span>
                <span className="text-white/90 font-medium">
                  {balances.funding.totalBalanceUSDT.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
                  USDT
                </span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-[#22304A]/50">
                <span className="text-white/80 font-medium">Total:</span>
                <span className="text-white font-semibold">
                  {data.totalBalanceUSDT.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
                  USDT
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid xl:grid-cols-4 grid-cols-2 gap-2 pt-4 border-t border-[#22304A]/50">
                <Button
                  onClick={() => {
                    const button = buyModalRef.current?.querySelector("button");
                    button?.click();
                  }}
                  size="sm"
                  className="bg-[#FFF]  text-[#0c1e4e] hover:bg-[#0c1e4e]/80 hover:text-white border border-transparent hover:border-[#FFF] cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Buy
                </Button>
                <Button
                  onClick={() => setShowDepositModal(true)}
                  size="sm"
                  className="bg-[#FFF]  text-[#0c1e4e] hover:bg-[#0c1e4e]/80 hover:text-white border border-transparent hover:border-[#FFF] cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Deposit
                </Button>
                <Button
                  onClick={() => setShowTransferModal(true)}
                  size="sm"
                  className="bg-[#FFF]  text-[#0c1e4e] hover:bg-[#0c1e4e]/80 hover:text-white border border-transparent hover:border-[#FFF] cursor-pointer"
                >
                  <ArrowUpDown className="w-4 h-4 mr-1" />
                  Transfer
                </Button>
                <Button
                  onClick={() => setShowWithdrawModal(true)}
                  size="sm"
                  className="bg-[#FFF]  text-[#0c1e4e] hover:bg-[#0c1e4e]/80 hover:text-white border border-transparent hover:border-[#FFF] cursor-pointer"
                >
                  <Minus className="w-4 h-4 mr-1" />
                  Withdraw
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Chart */}
        <Card className="bg-[#081935] border-[#22304A] shadow-xl rounded-xl hover:shadow-[0_10px_30px_-5px_rgba(34,48,74,0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-[#2d3f6e]">
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-[#EC3B3B]" />
              <span className="font-semibold text-[#FFF] italic">
                Balance (24h)
              </span>
            </div>
            <div className="lg:h-80">
              <canvas id="balance-line-chart" />
            </div>
          </CardContent>
        </Card>
      </div>

      <LineChartRenderer data={lineChartData} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-[#081935] border border-[#22304A] shadow-xl rounded-xl p-6"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#DAE6EA]">
          <TrendingDown className="text-[#EC3B3B]" /> Recent Activity
        </h2>
        <Table className="text-sm text-white rounded-lg overflow-hidden">
          <TableHeader>
            <TableRow className="hover:bg-[#0c1e4e]/90 transition-colors">
              <TableHead className="px-6 py-3 font-medium text-white/90">
                Date
              </TableHead>
              <TableHead className="px-6 py-3 font-medium text-white/90">
                Action
              </TableHead>
              <TableHead className="px-6 py-3 font-medium text-white/90">
                Amount
              </TableHead>
              <TableHead className="px-6 py-3 font-medium text-white/90">
                Transaction ID
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-[#081935]/50">
            {data.txs.map((tx, i) => (
              <TableRow
                key={i}
                className="border-t border-[#22304A]/50 hover:bg-[#1e3a8a]/30 transition-all duration-200 group"
              >
                <TableCell className="px-6 py-4 font-medium text-white/90">
                  {tx.date}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Badge
                    className={`text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition-transform duration-200 group-hover:scale-105 w-20 text-center inline-flex justify-center ${
                      tx.action === "Deposit"
                        ? "bg-green-500/90 hover:bg-green-500"
                        : tx.action === "Withdraw"
                        ? "bg-red-500/90 hover:bg-red-500"
                        : "bg-blue-500/90 hover:bg-blue-500"
                    }`}
                  >
                    {tx.action}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 flex items-center gap-2">
                  {COINS.find((c) => c.symbol === tx.symbol)?.icon && (
                    <span className="w-5 h-5 flex items-center justify-center">
                      {COINS.find((c) => c.symbol === tx.symbol)?.icon}
                    </span>
                  )}
                  <span className="font-mono text-white/90">{tx.amount}</span>
                  <span className="text-xs text-white/60">{tx.symbol}</span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-white/70 hover:text-white transition-colors cursor-pointer">
                      {tx.txId.slice(0, 8)}...{tx.txId.slice(-4)}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-white">
                      <CopyIcon className="w-3 h-3" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      {/* Hidden BuyCryptoModal trigger */}
      <div className="hidden">
        <div ref={buyModalRef}>
          <BuyCryptoModal />
        </div>
      </div>

      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        accountType="funding"
      />

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        accountType="funding"
      />

      {/* Transfer Modal */}
      {showTransferModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isTransferring) {
              setShowTransferModal(false);
            }
          }}
        >
          <Card className="bg-[#081935] border-[#22304A] w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Transfer</h3>
                <Button
                  onClick={() => setShowTransferModal(false)}
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white p-1"
                  disabled={isTransferring}
                >
                  <X size={20} />
                </Button>
              </div>

              <div className="space-y-4">
                {/* From Account */}
                <div>
                  <label className="text-white/80 text-sm mb-2 block">
                    From
                  </label>
                  <Select
                    value={fromAccount}
                    onValueChange={(value) =>
                      setFromAccount(value as "trading" | "funding")
                    }
                  >
                    <SelectTrigger className="w-full bg-[#22304A] border-[#22304A] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#081935] border-[#22304A]">
                      <SelectItem value="trading" className="text-white/80">
                        <div className="flex justify-between items-center w-full">
                          <span>Trading Account</span>
                          <span className="text-sm ml-2">
                            (
                            {selectedCoin === "USDT"
                              ? balances.trading.totalBalanceUSDT.toFixed(2)
                              : (
                                  balances.trading.totalBalanceUSDT /
                                  exchangeRates.BTC.USD
                                ).toFixed(6)}{" "}
                            {selectedCoin})
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="funding" className="text-white/80">
                        <div className="flex justify-between items-center w-full">
                          <span>Funding Account</span>
                          <span className="text-sm ml-2">
                            (
                            {selectedCoin === "USDT"
                              ? balances.funding.totalBalanceUSDT.toFixed(2)
                              : (
                                  balances.funding.totalBalanceUSDT /
                                  exchangeRates.BTC.USD
                                ).toFixed(6)}{" "}
                            {selectedCoin})
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* To Account */}
                <div>
                  <label className="text-white/80 text-sm mb-2 block">To</label>
                  <Select
                    value={toAccount}
                    onValueChange={(value) =>
                      setToAccount(value as "trading" | "funding")
                    }
                  >
                    <SelectTrigger className="w-full bg-[#22304A] border-[#22304A] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#081935] border-[#22304A]">
                      <SelectItem value="trading" className="text-white/80">
                        <div className="flex justify-between items-center w-full">
                          <span>Trading Account</span>
                          <span className="text-sm ml-2">
                            (
                            {selectedCoin === "USDT"
                              ? balances.trading.totalBalanceUSDT.toFixed(2)
                              : (
                                  balances.trading.totalBalanceUSDT /
                                  exchangeRates.BTC.USD
                                ).toFixed(6)}{" "}
                            {selectedCoin})
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="funding" className="text-white/80">
                        <div className="flex justify-between items-center w-full">
                          <span>Funding Account</span>
                          <span className="text-sm ml-2">
                            (
                            {selectedCoin === "USDT"
                              ? balances.funding.totalBalanceUSDT.toFixed(2)
                              : (
                                  balances.funding.totalBalanceUSDT /
                                  exchangeRates.BTC.USD
                                ).toFixed(6)}{" "}
                            {selectedCoin})
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Coin Selection */}
                <div>
                  <label className="text-white/80 text-sm mb-2 block">
                    Coin
                  </label>
                  <Select
                    value={selectedCoin}
                    onValueChange={(value) =>
                      setSelectedCoin(value as "USDT" | "BTC")
                    }
                  >
                    <SelectTrigger className="w-full bg-[#22304A] border-[#22304A] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#081935] border-[#22304A]">
                      <SelectItem value="USDT" className="text-white/80">
                        <div className="flex items-center gap-2">
                          <SiTether className="w-5 h-5 text-[#26A17B]" />
                          <span>USDT</span>
                          <span className="hover:text-black!">(Tether)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="BTC" className="text-white/80">
                        <div className="flex items-center gap-2">
                          <FaBitcoin className="text-yellow-400" />
                          <span>BTC</span>
                          <span className="hover:text-black!">(Bitcoin)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="text-white/80 text-sm mb-2 block">
                    Quantity
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="w-full bg-[#22304A] border-[#22304A] text-white px-3 py-2 rounded-md pr-20"
                      placeholder="Min 0.00000001"
                      min="0.00000001"
                      step="0.00000001"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      <span className="text-white/60 text-sm">
                        {selectedCoin}
                      </span>
                      <Button
                        onClick={() => {
                          const maxAmount =
                            selectedCoin === "USDT"
                              ? balances[fromAccount].totalBalanceUSDT
                              : balances[fromAccount].totalBalanceUSDT /
                                exchangeRates.BTC.USD;
                          setTransferAmount(
                            maxAmount.toFixed(selectedCoin === "USDT" ? 2 : 6)
                          );
                        }}
                        size="sm"
                        className="bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs px-2 py-1 h-6"
                      >
                        MAX
                      </Button>
                    </div>
                  </div>
                </div>

                {/* USD Equivalent */}
                {transferAmount && !isNaN(parseFloat(transferAmount)) && (
                  <div className="text-white/60 text-sm">
                    ≈ $
                    {selectedCoin === "USDT"
                      ? parseFloat(transferAmount).toFixed(2)
                      : (
                          parseFloat(transferAmount) * exchangeRates.BTC.USD
                        ).toFixed(2)}{" "}
                    USD
                  </div>
                )}

                {/* Transfer Confirmation Card */}
                {transferAmount &&
                  !isNaN(parseFloat(transferAmount)) &&
                  parseFloat(transferAmount) > 0 && (
                    <div className="bg-[#22304A]/50 border border-[#22304A] rounded-lg p-4 space-y-3">
                      <h4 className="text-white font-medium text-sm">
                        Transfer Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">
                            Transfer Amount:
                          </span>
                          <span className="text-white font-medium">
                            {parseFloat(transferAmount).toFixed(
                              selectedCoin === "USDT" ? 2 : 6
                            )}{" "}
                            {selectedCoin}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">Direction:</span>
                          <span className="text-white font-medium">
                            {fromAccount === "trading" ? "Trading" : "Funding"}{" "}
                            → {toAccount === "trading" ? "Trading" : "Funding"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">USD Equivalent:</span>
                          <span className="text-white">
                            $
                            {selectedCoin === "USDT"
                              ? parseFloat(transferAmount).toFixed(2)
                              : (
                                  parseFloat(transferAmount) *
                                  exchangeRates.BTC.USD
                                ).toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t border-[#22304A] pt-2 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">
                              From Balance After:
                            </span>
                            <span className="text-white">
                              {(() => {
                                const transferAmountValue =
                                  parseFloat(transferAmount) || 0;
                                const requiredAmount =
                                  selectedCoin === "USDT"
                                    ? transferAmountValue
                                    : transferAmountValue *
                                      exchangeRates.BTC.USD;
                                const remainingBalance =
                                  selectedCoin === "USDT"
                                    ? balances[fromAccount].totalBalanceUSDT -
                                      requiredAmount
                                    : (balances[fromAccount].totalBalanceUSDT -
                                        requiredAmount) /
                                      exchangeRates.BTC.USD;
                                return selectedCoin === "USDT"
                                  ? remainingBalance.toFixed(2)
                                  : remainingBalance.toFixed(6);
                              })()}{" "}
                              {selectedCoin}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-white/60">
                              To Balance After:
                            </span>
                            <span className="text-white">
                              {(() => {
                                const transferAmountValue =
                                  parseFloat(transferAmount) || 0;
                                const requiredAmount =
                                  selectedCoin === "USDT"
                                    ? transferAmountValue
                                    : transferAmountValue *
                                      exchangeRates.BTC.USD;
                                const newBalance =
                                  selectedCoin === "USDT"
                                    ? balances[toAccount].totalBalanceUSDT +
                                      requiredAmount
                                    : (balances[toAccount].totalBalanceUSDT +
                                        requiredAmount) /
                                      exchangeRates.BTC.USD;
                                return selectedCoin === "USDT"
                                  ? newBalance.toFixed(2)
                                  : newBalance.toFixed(6);
                              })()}{" "}
                              {selectedCoin}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mt-3">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                          <div className="text-xs text-blue-300">
                            <strong>Note:</strong> Transfers are processed
                            instantly between your accounts. Make sure you have
                            sufficient balance in your{" "}
                            {fromAccount === "trading" ? "trading" : "funding"}{" "}
                            account.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Confirm Button */}
                <Button
                  onClick={handleTransfer}
                  className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                  disabled={
                    !transferAmount ||
                    isNaN(parseFloat(transferAmount)) ||
                    parseFloat(transferAmount) <= 0 ||
                    fromAccount === toAccount ||
                    isTransferring
                  }
                >
                  {isTransferring ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    "Confirm Transfer"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Toast Notification */}
      {showToast.show && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-4 py-3 rounded-md shadow-lg ${
              showToast.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white`}
          >
            {showToast.message}
            <Button
              onClick={() => setShowToast({ ...showToast, show: false })}
              variant="ghost"
              size="sm"
              className="ml-2 text-white hover:text-white/80 p-0"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function LineChartRenderer({ data }: { data: any }) {
  useEffect(() => {
    const ctx = document.getElementById(
      "balance-line-chart"
    ) as HTMLCanvasElement;
    if (!ctx) return;

    let chart: Chart | null = null;

    // Create gradient for the area under the line
    const gradient = ctx
      .getContext("2d")
      ?.createLinearGradient(0, 0, 0, ctx.height);
    gradient?.addColorStop(0, "rgba(59, 130, 246, 0.4)");
    gradient?.addColorStop(1, "rgba(59, 130, 246, 0.01)");

    // Format labels to HH:MM if they are dates
    const formattedLabels = data.labels.map((label: string | Date) => {
      try {
        const date = label instanceof Date ? label : new Date(label);
        return isNaN(date.getTime()) ? label : formatToHHMM(date);
      } catch {
        return label;
      }
    });

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: formattedLabels,
        datasets: data.datasets.map((dataset: any) => ({
          ...dataset,
          borderColor: "#3b82f6",
          backgroundColor: gradient,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointBackgroundColor: "#3b82f6",
          pointHoverBackgroundColor: "#fff",
          pointBorderWidth: 2,
          pointHoverBorderWidth: 2,
          pointHoverBorderColor: "#3b82f6",
          fill: true,
          tension: 0.4,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            mode: "index",
            intersect: false,
            backgroundColor: "#0f172a",
            titleColor: "#94a3b8",
            bodyColor: "#ffffff",
            borderColor: "#1e293b",
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: (items) => {
                if (items.length > 0) {
                  return formattedLabels[items[0].dataIndex] || "";
                }
                return "";
              },
              label: (context) => {
                return `$${context.parsed.y.toLocaleString()}`;
              },
            },
          },
        },
        interaction: {
          mode: "nearest",
          axis: "x",
          intersect: false,
        },
        scales: {
          x: {
            grid: {
              display: false,
              // drawBorder is not a valid property for x-axis grid in Chart.js v4+
            },
            ticks: {
              color: "#64748b",
              font: {
                size: 11,
                family: "Inter, sans-serif",
              },
              callback: (value) => {
                return formattedLabels[value as number] || "";
              },
            },
          },
          y: {
            grid: {
              color: "rgba(30, 41, 59, 0.5)",
              drawTicks: false,
            },
            ticks: {
              color: "#64748b",
              font: {
                size: 11,
                family: "Inter, sans-serif",
              },
              callback: (value) => `$${Number(value).toLocaleString()}`,
            },
            beginAtZero: false,
          },
        },
        elements: {
          line: {
            cubicInterpolationMode: "monotone",
          },
        },
      },
    });

    return () => chart?.destroy();
  }, [data]);

  return null;
}
function formatToHHMM(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}
