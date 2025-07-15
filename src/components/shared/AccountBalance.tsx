"use client";
import { useEffect, useState, useMemo } from "react";
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
import { SiSolana } from "react-icons/si";
import {
  DollarSign,
  PieChart,
  TrendingUp,
  TrendingDown,
  CopyIcon,
  ArrowUpDown,
  Plus,
  Minus,
  X,
} from "lucide-react";
import { Chart, registerables } from "chart.js";
import { BalanceData } from "@/lib/balance-manager";
import WithdrawModal from "@/components/dashboard/WithdrawModal";
import DepositModal from "@/components/dashboard/DepositModal";

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

interface AccountBalanceProps {
  accountType: "trading" | "funding";
  data: BalanceData;
  allBalances: {
    trading: BalanceData;
    funding: BalanceData;
  };
  onTransfer?: (
    fromAccount: "trading" | "funding",
    toAccount: "trading" | "funding",
    amount: number,
    coin: string
  ) => void;
  onAddTransaction?: (transaction: {
    date: string;
    action: string;
    amount: string;
    symbol: string;
  }) => void;
}

export default function AccountBalance({
  accountType,
  data,
  allBalances,
  onTransfer,
  onAddTransaction,
}: AccountBalanceProps) {
  // Live exchange rates state
  const [exchangeRates, setExchangeRates] = useState(FALLBACK_EXCHANGE_RATES);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [fromAccount, setFromAccount] = useState<"trading" | "funding">(
    accountType
  );
  const [toAccount, setToAccount] = useState<"trading" | "funding">(
    accountType === "trading" ? "funding" : "trading"
  );
  const [selectedCoin, setSelectedCoin] = useState<"USDT" | "BTC">("USDT");
  const [showToast, setShowToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });
  const [isTransferring, setIsTransferring] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [isBalanceUpdating, setIsBalanceUpdating] = useState(false);

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
    const interval = setInterval(fetchExchangeRates, 30000);
    return () => clearInterval(interval);
  }, []);

  // Show balance update animation when balance changes
  useEffect(() => {
    setIsBalanceUpdating(true);
    const timer = setTimeout(() => setIsBalanceUpdating(false), 1000);
    return () => clearTimeout(timer);
  }, [data.totalBalanceUSDT]);

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

  const accountTitle =
    accountType === "trading" ? "Trading Account" : "Funding Account";
  const accountDescription =
    accountType === "trading"
      ? "Your trading balance and activity."
      : "Your funding balance and deposit/withdrawal activity.";

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
    const sourceBalance = allBalances[fromAccount].totalBalanceUSDT;
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

      onTransfer?.(fromAccount, toAccount, requiredAmount, selectedCoin);
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

  const handleQuickAction = (action: string) => {
    const amount = (Math.random() * 100 + 10).toFixed(2);
    onAddTransaction?.({
      date: new Date().toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
      }),
      action,
      amount,
      symbol: "USDT",
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4 }}
        className="text-[#DAE6EA]"
      >
        {/* <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{accountTitle}</h1>
        <p className="text-lg opacity-80">{accountDescription}</p>
      </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Account Balance Card */}
          <Card className="bg-[#081935] border-[#22304A] shadow-2xl rounded-xl hover:shadow-[0_10px_30px_-5px_rgba(34,48,74,0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-[#2d3f6e]">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg text-white/90 italic">
                  {accountTitle} Balance
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
                key={data.totalBalanceUSDT} // This will trigger animation when balance changes
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
                {isBalanceUpdating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="ml-2 text-green-400 text-sm"
                  >
                    ✓ Updated
                  </motion.div>
                )}
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
                  onValueChange={(value) => setFiat(value as typeof fiat)}
                >
                  <SelectTrigger className="w-20 h-6 border-none bg-transparent text-white/80 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c1e4e] border-[#22304A]">
                    {CURRENCIES.map((currency) => (
                      <SelectItem
                        key={currency}
                        value={currency}
                        className="text-white/80"
                      >
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => setShowTransferModal(true)}
                  size="sm"
                  className="bg-[#FFF]  text-[#0c1e4e] hover:bg-[#0c1e4e]/80 hover:text-white border border-transparent hover:border-[#FFF] cursor-pointer"
                >
                  <ArrowUpDown className="w-4 h-4 mr-1" />
                  Transfer
                </Button>
                <Button
                  onClick={() => setShowDepositModal(true)}
                  size="sm"
                  variant="outline"
                  className="bg-[#FFF]  text-[#0c1e4e] hover:bg-[#0c1e4e]/80 hover:text-white border border-transparent hover:border-[#FFF] cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Deposit
                </Button>
                <Button
                  onClick={() => setShowWithdrawModal(true)}
                  size="sm"
                  variant="outline"
                  className="bg-[#FFF]  text-[#0c1e4e] hover:bg-[#0c1e4e]/80 hover:text-white border border-transparent hover:border-[#FFF] cursor-pointer"
                >
                  <Minus className="w-4 h-4 mr-1" />
                  Withdraw
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Performance Card */}
          <Card className="bg-[#081935] border-[#22304A] shadow-2xl rounded-xl hover:shadow-[0_10px_30px_-5px_rgba(34,48,74,0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-[#2d3f6e]">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg text-white/90 italic">
                  Performance
                </span>
                <PieChart className="text-[#3b82f6]" size={20} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-1">
                    <TrendingUp size={20} />
                    +$
                    {data.profit.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </div>
                  <p className="text-sm text-white/60">Total Profit</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400 flex items-center justify-center gap-1">
                    <TrendingDown size={20} />
                    -$
                    {data.loss.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </div>
                  <p className="text-sm text-white/60">Total Loss</p>
                </div>
              </div>

              <div className="text-center pt-2">
                <div className="text-lg font-semibold text-white">
                  Net: {data.profit - data.loss >= 0 ? "+" : ""}$
                  {(data.profit - data.loss).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </div>
                <p className="text-sm text-white/60">Overall Performance</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Balance History Chart */}
        <Card className="bg-[#081935] border-[#22304A] shadow-2xl rounded-xl mb-10">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Balance History</h2>
              <Badge
                variant="outline"
                className="border-[#22304A] text-white/80"
              >
                Last 24 Hours
              </Badge>
            </div>
            <div className="h-64">
              <LineChartRenderer data={lineChartData} />
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-[#081935] border-[#22304A] shadow-2xl rounded-xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                Recent Transactions
              </h2>
              <Badge
                variant="outline"
                className="border-[#22304A] text-white/80"
              >
                {data.txs.length} Transactions
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#22304A]">
                    <TableHead className="text-white/80">Date</TableHead>
                    <TableHead className="text-white/80">Action</TableHead>
                    <TableHead className="text-white/80">Amount</TableHead>
                    <TableHead className="text-white/80">Currency</TableHead>
                    <TableHead className="text-white/80">
                      Transaction ID
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.txs.map((tx, index) => (
                    <TableRow
                      key={index}
                      className="border-[#22304A] hover:bg-[#22304A]/20"
                    >
                      <TableCell className="text-white/90">{tx.date}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tx.action.includes("Transfer")
                              ? "default"
                              : tx.action === "Deposit"
                              ? "default"
                              : "destructive"
                          }
                          className={`${
                            tx.action.includes("Transfer")
                              ? "bg-blue-500/20 text-blue-400"
                              : tx.action === "Deposit"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          } border-none`}
                        >
                          {tx.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/90 font-medium">
                        {tx.amount}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {COINS.find((c) => c.symbol === tx.symbol)?.icon}
                          <span className="text-white/80">{tx.symbol}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-white/60 font-mono text-sm">
                            {tx.txId}
                          </span>
                          <CopyIcon
                            className="w-4 h-4 text-white/40 cursor-pointer hover:text-white/80"
                            onClick={() =>
                              navigator.clipboard.writeText(tx.txId)
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

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
                    className="text-white/60 hover:text-[#081935] p-1"
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
                            <span className="text-white/60 text-sm ml-2">
                              (
                              {selectedCoin === "USDT"
                                ? allBalances.trading.totalBalanceUSDT.toFixed(
                                    2
                                  )
                                : (
                                    allBalances.trading.totalBalanceUSDT /
                                    exchangeRates.BTC.USD
                                  ).toFixed(6)}{" "}
                              {selectedCoin})
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="funding" className="text-white/80">
                          <div className="flex justify-between items-center w-full">
                            <span>Funding Account</span>
                            <span className="text-white/60 text-sm ml-2">
                              (
                              {selectedCoin === "USDT"
                                ? allBalances.funding.totalBalanceUSDT.toFixed(
                                    2
                                  )
                                : (
                                    allBalances.funding.totalBalanceUSDT /
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
                    <label className="text-white/80 text-sm mb-2 block">
                      To
                    </label>
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
                            <span className="text-white/60 text-sm ml-2">
                              (
                              {selectedCoin === "USDT"
                                ? allBalances.trading.totalBalanceUSDT.toFixed(
                                    2
                                  )
                                : (
                                    allBalances.trading.totalBalanceUSDT /
                                    exchangeRates.BTC.USD
                                  ).toFixed(6)}{" "}
                              {selectedCoin})
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="funding" className="text-white/80">
                          <div className="flex justify-between items-center w-full">
                            <span>Funding Account</span>
                            <span className="text-white/60 text-sm ml-2">
                              (
                              {selectedCoin === "USDT"
                                ? allBalances.funding.totalBalanceUSDT.toFixed(
                                    2
                                  )
                                : (
                                    allBalances.funding.totalBalanceUSDT /
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
                            <span>USDT</span>
                            <span className="text-white/60">(Tether)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="BTC" className="text-white/80">
                          <div className="flex items-center gap-2">
                            <FaBitcoin className="text-yellow-400" />
                            <span>BTC</span>
                            <span className="text-white/60">(Bitcoin)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Balance Display */}
                  <div className="bg-[#22304A]/50 p-3 rounded-md">
                    <div className="text-white/80 text-sm mb-2">
                      Available Balance:
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">
                        {fromAccount === "trading" ? "Trading:" : "Funding:"}
                      </span>
                      <span className="text-white">
                        {(() => {
                          const currentBalance =
                            selectedCoin === "USDT"
                              ? allBalances[fromAccount].totalBalanceUSDT
                              : allBalances[fromAccount].totalBalanceUSDT /
                                exchangeRates.BTC.USD;

                          return selectedCoin === "USDT"
                            ? currentBalance.toFixed(2)
                            : currentBalance.toFixed(6);
                        })()}{" "}
                        {selectedCoin}
                      </span>
                    </div>
                    {transferAmount && parseFloat(transferAmount) > 0 && (
                      <div className="text-xs text-white/50 mt-1 border-t border-[#22304A] pt-2">
                        <div className="flex justify-between">
                          <span>After transfer:</span>
                          <span>
                            {(() => {
                              const transferAmountValue =
                                parseFloat(transferAmount) || 0;
                              const requiredAmount =
                                selectedCoin === "USDT"
                                  ? transferAmountValue
                                  : transferAmountValue * exchangeRates.BTC.USD;

                              const remainingBalance =
                                selectedCoin === "USDT"
                                  ? allBalances[fromAccount].totalBalanceUSDT -
                                    requiredAmount
                                  : (allBalances[fromAccount].totalBalanceUSDT -
                                      requiredAmount) /
                                    exchangeRates.BTC.USD;

                              return selectedCoin === "USDT"
                                ? remainingBalance.toFixed(2)
                                : remainingBalance.toFixed(6);
                            })()}{" "}
                            {selectedCoin}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quantity Input */}
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
                                ? allBalances[fromAccount].totalBalanceUSDT
                                : allBalances[fromAccount].totalBalanceUSDT /
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
        {/* Auto-hide toast after 3 seconds */}
        {showToast.show &&
          setTimeout(() => setShowToast({ ...showToast, show: false }), 3000) &&
          null}
      </motion.div>
      {/* Withdraw Modal - Rendered outside motion.div to avoid z-index issues */}
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        accountType={accountType}
      />

      {/* Deposit Modal - Rendered outside motion.div to avoid z-index issues */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        accountType={accountType}
      />
    </>
  );
}

// Chart component
export function LineChartRenderer({ data }: { data: any }) {
  useEffect(() => {
    const canvas = document.getElementById("lineChart") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Destroy existing chart
    Chart.getChart(canvas)?.destroy();

    new Chart(ctx, {
      type: "line",
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            display: true,
            grid: { color: "#22304A" },
            ticks: { color: "#DAE6EA" },
          },
          y: {
            display: true,
            grid: { color: "#22304A" },
            ticks: { color: "#DAE6EA" },
          },
        },
        elements: {
          point: { radius: 0 },
          line: { borderWidth: 2 },
        },
      },
    });
  }, [data]);

  return <canvas id="lineChart" className="w-full h-full" />;
}

function formatToHHMM(date: Date | string): string {
  if (typeof date === "string") {
    date = new Date(date);
  }
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
