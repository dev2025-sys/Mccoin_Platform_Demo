"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  FaBitcoin,
  FaEthereum,
  FaWallet,
  FaNetworkWired,
} from "react-icons/fa";
import { SiSolana, SiTether, SiBinance } from "react-icons/si";

// Dummy data for available cryptocurrencies
const cryptocurrencies = {
  BTC: {
    name: "Bitcoin",
    icon: <FaBitcoin className="w-5 h-5 text-[#F7931A]" />,
    networks: ["Bitcoin Network"],
    balance: {
      funding: 0.5,
      trading: 1.2,
    },
    fee: 0.0001,
  },
  ETH: {
    name: "Ethereum",
    icon: <FaEthereum className="w-5 h-5 text-[#627EEA]" />,
    networks: ["Ethereum Network", "Arbitrum", "Optimism"],
    balance: {
      funding: 2.5,
      trading: 4.7,
    },
    fee: 0.002,
  },
  SOL: {
    name: "Solana",
    icon: <SiSolana className="w-5 h-5 text-[#14F195]" />,
    networks: ["Solana Network"],
    balance: {
      funding: 45.2,
      trading: 78.9,
    },
    fee: 0.01,
  },
  USDT: {
    name: "Tether",
    icon: <SiTether className="w-5 h-5 text-[#26A17B]" />,
    networks: ["Ethereum (ERC20)", "Tron (TRC20)", "BSC (BEP20)"],
    balance: {
      funding: 1000.5,
      trading: 2500.75,
    },
    fee: 1,
  },
  BNB: {
    name: "Binance Coin",
    icon: <SiBinance className="w-5 h-5 text-[#F3BA2F]" />,
    networks: ["BNB Smart Chain"],
    balance: {
      funding: 10.5,
      trading: 15.3,
    },
    fee: 0.001,
  },
};

const formSchema = z.object({
  cryptocurrency: z.string({
    required_error: "Please select a cryptocurrency",
  }),
  walletAddress: z
    .string()
    .min(1, "Wallet address is required")
    .min(20, "Please enter a valid wallet address"),
  network: z.string({
    required_error: "Please select a network",
  }),
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num <= 0) return false;
      return true;
    },
    {
      message: "Amount must be greater than 0",
    }
  ),
});

type FormValues = z.infer<typeof formSchema>;

export default function WithdrawPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<
    keyof typeof cryptocurrencies | null
  >(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cryptocurrency: "",
      walletAddress: "",
      network: "",
      amount: "",
    },
  });

  const calculateFinalAmount = (amount: string): number => {
    if (!selectedCrypto || !amount) return 0;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return 0;
    return numAmount - cryptocurrencies[selectedCrypto].fee;
  };

  const onSubmit = async (data: FormValues) => {
    const crypto =
      cryptocurrencies[data.cryptocurrency as keyof typeof cryptocurrencies];
    const totalBalance = crypto.balance.funding + crypto.balance.trading;
    const amount = parseFloat(data.amount);

    if (amount > totalBalance) {
      form.setError("amount", {
        type: "manual",
        message: "Amount exceeds available balance",
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast.success("Withdrawal request submitted", {
      description: `Withdrawing ${data.amount} ${data.cryptocurrency} to ${data.network}`,
    });

    setIsSubmitting(false);
    form.reset();
    setSelectedCrypto(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto py-6 space-y-6"
    >
      <h1 className="text-2xl font-bold text-white mb-6">
        Withdraw Cryptocurrency
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Coin Selection */}
          <Card className="bg-[#081935] shadow-2xl border-[0.5px] rounded-md border-[#DAE6EA]">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <FaWallet className="w-5 h-5 text-[#EC3B3B]" />
                Select Cryptocurrency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="cryptocurrency"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedCrypto(
                          value as keyof typeof cryptocurrencies
                        );
                        form.setValue("network", "");
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 bg-[#0f294d] text-white border border-[#DAE6EA] focus:border-[#EC3B3B] focus:ring-[#EC3B3B]">
                          <SelectValue placeholder="Select a cryptocurrency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#0f294d] text-white border border-[#DAE6EA]">
                        {Object.entries(cryptocurrencies).map(
                          ([value, crypto]) => (
                            <SelectItem
                              key={value}
                              value={value}
                              className="h-12 flex items-center gap-2 cursor-pointer hover:bg-[#081935]"
                            >
                              <div className="flex items-center gap-2">
                                {crypto.icon}
                                <span>{crypto.name}</span>
                              </div>
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Wallet Address Section */}
          <Card className="bg-[#081935] shadow-2xl border-[0.5px] rounded-md border-[#DAE6EA]">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <FaNetworkWired className="w-5 h-5 text-[#EC3B3B]" />
                Wallet Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="walletAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Wallet Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your wallet address"
                        className="h-12 bg-[#0f294d] text-white border border-[#DAE6EA] focus:border-[#EC3B3B] focus:ring-[#EC3B3B] placeholder:text-gray-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="network"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Network</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-12 bg-[#0f294d] text-white border border-[#DAE6EA] focus:border-[#EC3B3B] focus:ring-[#EC3B3B]">
                          <SelectValue placeholder="Select network" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#0f294d] text-white border border-[#DAE6EA]">
                        {selectedCrypto &&
                          cryptocurrencies[selectedCrypto].networks.map(
                            (network) => (
                              <SelectItem
                                key={network}
                                value={network}
                                className="cursor-pointer hover:bg-[#081935]"
                              >
                                {network}
                              </SelectItem>
                            )
                          )}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Withdrawal Details */}
          <Card className="bg-[#081935] shadow-2xl border-[0.5px] rounded-md border-[#DAE6EA]">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                Withdrawal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter amount to withdraw"
                        className="h-12 bg-[#0f294d] text-white border border-[#DAE6EA] focus:border-[#EC3B3B] focus:ring-[#EC3B3B] placeholder:text-gray-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <FormLabel className="text-white mb-3">
                    Funding Account
                  </FormLabel>
                  <Input
                    readOnly
                    value={
                      selectedCrypto
                        ? `${cryptocurrencies[selectedCrypto].balance.funding} ${selectedCrypto}`
                        : "---"
                    }
                    className="h-12 bg-[#0f294d] text-white border border-[#DAE6EA]"
                  />
                </div>
                <div>
                  <FormLabel className="text-white mb-3">
                    Trading Account
                  </FormLabel>
                  <Input
                    readOnly
                    value={
                      selectedCrypto
                        ? `${cryptocurrencies[selectedCrypto].balance.trading} ${selectedCrypto}`
                        : "---"
                    }
                    className="h-12 bg-[#0f294d] text-white border border-[#DAE6EA]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Final Amount Section */}
          <Card className="bg-[#081935] shadow-2xl border-[0.5px] rounded-md border-[#DAE6EA]">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                Final Amount Received
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <FormLabel className="text-white mb-3">Network Fee</FormLabel>
                  <Input
                    readOnly
                    value={
                      selectedCrypto
                        ? `${cryptocurrencies[selectedCrypto].fee} ${selectedCrypto}`
                        : "---"
                    }
                    className="h-12 bg-[#0f294d] text-white border border-[#DAE6EA]"
                  />
                </div>
                <div>
                  <FormLabel className="text-white mb-3">
                    You Will Receive
                  </FormLabel>
                  <Input
                    readOnly
                    value={
                      selectedCrypto && form.getValues("amount")
                        ? `${calculateFinalAmount(
                            form.getValues("amount")
                          )} ${selectedCrypto}`
                        : "---"
                    }
                    className="h-12 bg-[#0f294d] text-white border border-[#DAE6EA]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-[#EC3B3B] hover:bg-[#d02f2f] text-white h-12 px-8"
              disabled={isSubmitting || !form.formState.isValid}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Withdraw"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
