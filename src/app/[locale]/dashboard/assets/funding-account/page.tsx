"use client";
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { useBalanceManager } from "@/lib/balance-manager";
import AccountBalance from "@/components/shared/AccountBalance";

export default function FundingAccountTab() {
  const {
    balances,
    updateFundingBalance,
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
    addTransaction("funding", transaction);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="text-[#DAE6EA]"
    >
      <div className="flex flex-col md:flex-row items-center mb-6 ">
        <DollarSign className="mr-3 text-[#EC3B3B]" size={32} />
        <div>
          <p className="text-lg opacity-80 mt-1 text-center md:text-left">
            Manage your deposits, withdrawals, and funding sources. Track your
            funding account activity in real time.
          </p>
        </div>
      </div>

      <AccountBalance
        accountType="funding"
        data={balances.funding}
        allBalances={balances}
        onTransfer={handleTransfer}
        onAddTransaction={handleAddTransaction}
      />
    </motion.div>
  );
}
