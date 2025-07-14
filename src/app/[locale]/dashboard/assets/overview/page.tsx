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
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import { SiSolana } from "react-icons/si";
import {
  DollarSign,
  PieChart,
  TrendingUp,
  TrendingDown,
  CopyIcon,
} from "lucide-react";
import { Chart, registerables } from "chart.js";
import { useBalanceManager } from "@/lib/balance-manager";

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
  const { balances } = useBalanceManager();
  const data = balances.overview;

  // Live exchange rates state
  const [exchangeRates, setExchangeRates] = useState(FALLBACK_EXCHANGE_RATES);
  const [isLoadingRates, setIsLoadingRates] = useState(false);

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
                <SelectTrigger className="w-20 h-7 bg-[#0c1e4e] border-[#22304A] text-xs text-white hover:bg-[#FFF] transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#081935] border-[#22304A] shadow-lg">
                  {CURRENCIES.map((c) => (
                    <SelectItem
                      key={c}
                      value={c}
                      className="text-xs text-white hover:bg-[#0c1e4e] focus:bg-[#0c1e4e] hover:text-white!"
                    >
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
            <div className="h-40">
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
