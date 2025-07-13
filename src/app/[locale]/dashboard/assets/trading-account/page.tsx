"use client";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useBalanceManager } from "@/lib/balance-manager";
import AccountBalance from "@/components/shared/AccountBalance";

export default function TradingAccountTab() {
  const {
    balances,
    updateTradingBalance,
    addTransaction,
    transferBetweenAccounts,
  } = useBalanceManager();

  const handleTransfer = (
    fromAccount: "trading" | "funding",
    toAccount: "trading" | "funding",
    amount: number,
    coin: string
  ) => {
    try {
      transferBetweenAccounts(fromAccount, toAccount, amount);
    } catch (error) {
      console.error("Transfer failed:", error);
      // You could show a toast notification here
    }
  };

  const handleAddTransaction = (transaction: {
    date: string;
    action: string;
    amount: string;
    symbol: string;
  }) => {
    addTransaction("trading", transaction);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="text-[#DAE6EA]"
    >
      <div className="flex flex-col md:flex-row items-center mb-6">
        <TrendingUp className="mr-3 text-[#EC3B3B]" size={32} />
        <div>
          {/* <h1 className="text-3xl font-bold">Trading Account</h1> */}
          <p className="text-lg opacity-80 mt-1 text-center md:text-left">
            View and manage your trading account balance. Execute trades and
            monitor your trading performance.
          </p>
        </div>
      </div>

      <AccountBalance
        accountType="trading"
        data={balances.trading}
        allBalances={balances}
        onTransfer={handleTransfer}
        onAddTransaction={handleAddTransaction}
      />
    </motion.div>
  );
}
