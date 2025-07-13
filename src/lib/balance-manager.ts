import { useState, useEffect, useCallback } from "react";

export interface BalanceData {
  totalBalanceUSDT: number;
  balanceHistory: BalanceHistoryPoint[];
  profit: number;
  loss: number;
  txs: Tx[];
}

export interface BalanceHistoryPoint {
  time: number;
  value: number;
}

export interface Tx {
  date: string;
  action: string;
  amount: string;
  symbol: string;
  txId: string;
}

export interface AccountBalances {
  trading: BalanceData;
  funding: BalanceData;
  overview: BalanceData;
}

const STORAGE_KEY = "dashboard_account_balances";

// Default data generators
function generateBalanceHistory(baseBalance: number): BalanceHistoryPoint[] {
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

function generateTransactions(count: number = 8): Tx[] {
  const COINS = ["BTC", "ETH", "SOL", "USDT"];
  const ACTIONS = ["Deposit", "Withdraw", "Trade", "Transfer"];

  return Array.from({ length: count }, () => {
    const coin = COINS[Math.floor(Math.random() * COINS.length)];
    const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    const randomDate = new Date(
      Date.now() - Math.random() * 24 * 60 * 60 * 1000 * 7
    );

    return {
      date: randomDate.toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
      }),
      action,
      amount: getRandomAmount(coin),
      symbol: coin,
      txId: generateTxId(),
    };
  });
}

function getRandomAmount(symbol: string): string {
  if (symbol === "BTC") return (Math.random() * 0.1 + 0.01).toFixed(5);
  if (symbol === "ETH") return (Math.random() * 1 + 0.1).toFixed(4);
  if (symbol === "SOL") return (Math.random() * 10 + 1).toFixed(2);
  return (Math.random() * 100 + 10).toFixed(2);
}

function generateTxId(): string {
  return (
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10)
  ).toUpperCase();
}

function createDefaultBalances(): AccountBalances {
  // Generate random balances that add up correctly
  const tradingBalance = 5000 + Math.random() * 3000; // 5000-8000
  const fundingBalance = 4000 + Math.random() * 2000; // 4000-6000
  const overviewBalance = tradingBalance + fundingBalance;

  return {
    trading: {
      totalBalanceUSDT: tradingBalance,
      balanceHistory: generateBalanceHistory(tradingBalance),
      profit: Math.random() * 1000 + 500,
      loss: Math.random() * 500 + 200,
      txs: generateTransactions(6),
    },
    funding: {
      totalBalanceUSDT: fundingBalance,
      balanceHistory: generateBalanceHistory(fundingBalance),
      profit: Math.random() * 800 + 300,
      loss: Math.random() * 400 + 100,
      txs: generateTransactions(5),
    },
    overview: {
      totalBalanceUSDT: overviewBalance,
      balanceHistory: generateBalanceHistory(overviewBalance),
      profit: 0, // Will be calculated
      loss: 0, // Will be calculated
      txs: [], // Will be combined
    },
  };
}

export function useBalanceManager() {
  const [balances, setBalances] = useState<AccountBalances>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate the balance equation
        const calculatedOverview =
          parsed.trading.totalBalanceUSDT + parsed.funding.totalBalanceUSDT;
        if (
          Math.abs(parsed.overview.totalBalanceUSDT - calculatedOverview) > 0.01
        ) {
          // Fix the balance if it's out of sync
          parsed.overview.totalBalanceUSDT = calculatedOverview;
          parsed.overview.balanceHistory =
            generateBalanceHistory(calculatedOverview);
        }
        return parsed;
      }
    }
    return createDefaultBalances();
  });

  // Sync to localStorage whenever balances change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(balances));
    }
  }, [balances]);

  // Recalculate overview when trading or funding changes
  useEffect(() => {
    const newOverviewBalance =
      balances.trading.totalBalanceUSDT + balances.funding.totalBalanceUSDT;
    const newOverviewProfit = balances.trading.profit + balances.funding.profit;
    const newOverviewLoss = balances.trading.loss + balances.funding.loss;
    const combinedTxs = [...balances.trading.txs, ...balances.funding.txs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    setBalances((prev) => ({
      ...prev,
      overview: {
        ...prev.overview,
        totalBalanceUSDT: newOverviewBalance,
        balanceHistory: generateBalanceHistory(newOverviewBalance),
        profit: newOverviewProfit,
        loss: newOverviewLoss,
        txs: combinedTxs,
      },
    }));
  }, [
    balances.trading.totalBalanceUSDT,
    balances.funding.totalBalanceUSDT,
    balances.trading.profit,
    balances.funding.profit,
    balances.trading.loss,
    balances.funding.loss,
  ]);

  const updateTradingBalance = useCallback(
    (newBalance: Partial<BalanceData>) => {
      setBalances((prev) => ({
        ...prev,
        trading: { ...prev.trading, ...newBalance },
      }));
    },
    []
  );

  const updateFundingBalance = useCallback(
    (newBalance: Partial<BalanceData>) => {
      setBalances((prev) => ({
        ...prev,
        funding: { ...prev.funding, ...newBalance },
      }));
    },
    []
  );

  const addTransaction = useCallback(
    (accountType: "trading" | "funding", transaction: Omit<Tx, "txId">) => {
      const newTx = { ...transaction, txId: generateTxId() };

      setBalances((prev) => ({
        ...prev,
        [accountType]: {
          ...prev[accountType],
          txs: [newTx, ...prev[accountType].txs].slice(0, 10),
        },
      }));
    },
    []
  );

  const transferBetweenAccounts = useCallback(
    (
      fromAccount: "trading" | "funding",
      toAccount: "trading" | "funding",
      amount: number
    ) => {
      if (fromAccount === toAccount) return;

      setBalances((prev) => {
        const fromBalance = prev[fromAccount].totalBalanceUSDT;
        const toBalance = prev[toAccount].totalBalanceUSDT;

        if (fromBalance < amount) {
          throw new Error("Insufficient balance");
        }

        const newFromBalance = fromBalance - amount;
        const newToBalance = toBalance + amount;

        return {
          ...prev,
          [fromAccount]: {
            ...prev[fromAccount],
            totalBalanceUSDT: newFromBalance,
            balanceHistory: generateBalanceHistory(newFromBalance),
            txs: [
              {
                date: new Date().toLocaleString("en-US", {
                  day: "2-digit",
                  month: "short",
                }),
                action: "Transfer Out",
                amount: amount.toFixed(2),
                symbol: "USDT",
                txId: generateTxId(),
              },
              ...prev[fromAccount].txs,
            ].slice(0, 10),
          },
          [toAccount]: {
            ...prev[toAccount],
            totalBalanceUSDT: newToBalance,
            balanceHistory: generateBalanceHistory(newToBalance),
            txs: [
              {
                date: new Date().toLocaleString("en-US", {
                  day: "2-digit",
                  month: "short",
                }),
                action: "Transfer In",
                amount: amount.toFixed(2),
                symbol: "USDT",
                txId: generateTxId(),
              },
              ...prev[toAccount].txs,
            ].slice(0, 10),
          },
        };
      });
    },
    []
  );

  return {
    balances,
    updateTradingBalance,
    updateFundingBalance,
    addTransaction,
    transferBetweenAccounts,
  };
}
