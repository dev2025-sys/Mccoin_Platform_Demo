"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Copy, QrCode, Loader2, AlertCircle } from "lucide-react";
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import { SiSolana, SiTether } from "react-icons/si";
import { useBalanceManager } from "@/lib/balance-manager";
import toast from "react-hot-toast";

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

// Generate wallet addresses based on coin and network
function generateWalletAddress(coin: string, network: string): string {
  const addresses = {
    BTC: {
      "Bitcoin Network": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    },
    USDT: {
      "Ethereum (ERC20)": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      "Tron (TRC20)": "TQn9Y2khDD95J42FQtQTdw6S5vLzqJqKpS",
      "BSC (BEP20)": "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    },
    SOL: {
      "Solana Network": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    },
  };

  const coinAddresses = addresses[coin as keyof typeof addresses];
  if (!coinAddresses) return "";

  return (coinAddresses as Record<string, string>)[network] || "";
}

// Format address as shallow preview
function formatAddressPreview(address: string): string {
  if (!address) return "";
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Get wallet addresses from localStorage
function getWalletAddresses(): Record<string, Record<string, string>> {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem("dashboard_account_balances");
    if (!stored) return {};

    const data = JSON.parse(stored);
    return data.walletAddresses || {};
  } catch (error) {
    console.error("Error reading wallet addresses from localStorage:", error);
    return {};
  }
}

// Save wallet addresses to localStorage
function saveWalletAddresses(
  addresses: Record<string, Record<string, string>>
) {
  if (typeof window === "undefined") return;

  try {
    const existing = localStorage.getItem("dashboard_account_balances");
    const data = existing ? JSON.parse(existing) : {};

    data.walletAddresses = addresses;
    localStorage.setItem("dashboard_account_balances", JSON.stringify(data));
  } catch (error) {
    console.error("Error saving wallet addresses to localStorage:", error);
  }
}

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountType: "trading" | "funding";
}

interface CoinData {
  symbol: string;
  name: string;
  icon: React.ReactNode;
  networks: string[];
  fee: number;
  minWithdrawal: number;
}

const COINS: Record<string, CoinData> = {
  BTC: {
    symbol: "BTC",
    name: "Bitcoin",
    icon: <FaBitcoin className="w-5 h-5 text-[#F7931A]" />,
    networks: ["Bitcoin Network"],
    fee: 0.0001,
    minWithdrawal: 0.001,
  },
  USDT: {
    symbol: "USDT",
    name: "Tether",
    icon: <SiTether className="w-5 h-5 text-[#26A17B]" />,
    networks: ["Ethereum (ERC20)", "Tron (TRC20)", "BSC (BEP20)"],
    fee: 0.01,
    minWithdrawal: 1,
  },
  SOL: {
    symbol: "SOL",
    name: "Solana",
    icon: <SiSolana className="w-5 h-5 text-[#14F195]" />,
    networks: ["Solana Network"],
    fee: 0.01,
    minWithdrawal: 0.1,
  },
};

export default function WithdrawModal({
  isOpen,
  onClose,
  accountType,
}: WithdrawModalProps) {
  const { balances, updateTradingBalance, updateFundingBalance } =
    useBalanceManager();
  const [selectedCoin, setSelectedCoin] = useState<string>("");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [walletAddresses, setWalletAddresses] = useState<
    Record<string, Record<string, string>>
  >({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize wallet addresses from localStorage
  useEffect(() => {
    const addresses = getWalletAddresses();
    if (Object.keys(addresses).length === 0) {
      // Generate default addresses for all coins and networks
      const defaultAddresses: Record<string, Record<string, string>> = {};

      Object.entries(COINS).forEach(([coin, coinData]) => {
        defaultAddresses[coin] = {};
        coinData.networks.forEach((network) => {
          defaultAddresses[coin][network] = generateWalletAddress(
            coin,
            network
          );
        });
      });

      setWalletAddresses(defaultAddresses);
      saveWalletAddresses(defaultAddresses);
    } else {
      setWalletAddresses(addresses);
    }
  }, []);

  // Get current wallet address preview
  const getCurrentWalletAddress = () => {
    if (!selectedCoin || !selectedNetwork) return "";
    return walletAddresses[selectedCoin]?.[selectedNetwork] || "";
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedCoin("");
      setSelectedNetwork("");
      setWalletAddress("");
      setAmount("");
      setOtp(["", "", "", ""]);
      setIsOtpSent(false);
      setShowQRScanner(false);
    }
  }, [isOpen]);

  // Send OTP when amount is entered
  useEffect(() => {
    if (
      amount &&
      !isNaN(parseFloat(amount)) &&
      parseFloat(amount) > 0 &&
      !isOtpSent
    ) {
      // Simulate sending OTP
      setTimeout(() => {
        setIsOtpSent(true);
        toast.success("OTP sent to your email!");
      }, 500);
    } else if (
      (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) &&
      isOtpSent
    ) {
      setIsOtpSent(false);
      setOtp(["", "", "", ""]);
    }
  }, [amount, isOtpSent]);

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next input
    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP input keydown
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP input paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").slice(0, 4);
    const newOtp = [...otp];

    for (let i = 0; i < pastedText.length && i < 4; i++) {
      if (/^\d$/.test(pastedText[i])) {
        newOtp[i] = pastedText[i];
      }
    }

    setOtp(newOtp);

    // Focus on the next empty input or the last input
    const nextIndex = Math.min(pastedText.length, 3);
    otpRefs.current[nextIndex]?.focus();
  };

  // Get available balance for selected coin
  const getAvailableBalance = () => {
    if (!selectedCoin) return 0;

    // For now, we'll use USDT balance and convert to other coins
    // In a real app, you'd have separate balances for each coin
    const totalBalance =
      balances.trading.totalBalanceUSDT + balances.funding.totalBalanceUSDT;

    if (selectedCoin === "USDT") {
      return totalBalance;
    } else if (selectedCoin === "BTC") {
      // Convert USDT to BTC (assuming 1 BTC = 65000 USDT)
      return totalBalance / 65000;
    } else if (selectedCoin === "SOL") {
      // Convert USDT to SOL (assuming 1 SOL = 100 USDT)
      return totalBalance / 100;
    }

    return 0;
  };

  // Get account-specific balance
  const getAccountBalance = () => {
    if (!selectedCoin) return 0;

    const accountBalance = balances[accountType].totalBalanceUSDT;

    if (selectedCoin === "USDT") {
      return accountBalance;
    } else if (selectedCoin === "BTC") {
      return accountBalance / 65000;
    } else if (selectedCoin === "SOL") {
      return accountBalance / 100;
    }

    return 0;
  };

  // Calculate fee and final amount
  const fee = selectedCoin ? COINS[selectedCoin]?.fee || 0 : 0;
  const amountNum = parseFloat(amount) || 0;
  const finalAmount = amountNum - fee;

  // Handle paste from clipboard
  const handlePaste = async () => {
    try {
      // Try the modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setWalletAddress(text.trim());
          toast.success("Address pasted from clipboard");
          return;
        } else {
          toast.error("No text found in clipboard");
          return;
        }
      }
    } catch (error) {
      console.error("Clipboard API error:", error);
    }

    // Fallback: Use document.execCommand for older browsers
    try {
      const input = document.createElement("input");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.focus();

      const success = document.execCommand("paste");
      if (success) {
        const pastedText = input.value;
        if (pastedText && pastedText.trim()) {
          setWalletAddress(pastedText.trim());
          toast.success("Address pasted from clipboard");
        } else {
          toast.error("No text found in clipboard");
        }
      } else {
        toast.error("Paste failed. Please use Ctrl+V in the input field.");
      }

      document.body.removeChild(input);
    } catch (fallbackError) {
      console.error("Fallback paste error:", fallbackError);
      toast.error(
        "Paste failed. Please use Ctrl+V in the input field or the Test button."
      );
    }
  };

  // Handle QR code scanning
  const startQRScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowQRScanner(true);
      }
    } catch (error) {
      toast.error("Failed to access camera");
    }
  };

  const stopQRScanner = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setShowQRScanner(false);
  };

  // Handle max amount
  const handleMaxAmount = () => {
    const maxAmount = getAccountBalance();
    setAmount(maxAmount.toFixed(6));
  };

  // Handle withdrawal
  const handleWithdraw = async () => {
    if (!selectedCoin || !selectedNetwork || !walletAddress || !amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate OTP
    const otpValue = otp.join("");
    if (otpValue.length !== 4) {
      toast.error("Please enter the complete OTP");
      return;
    }

    // Simulate OTP verification (in real app, verify with backend)
    if (otpValue !== "0000") {
      toast.error("Invalid OTP. Please try again.");
      return;
    }

    const amountNum = parseFloat(amount);
    const accountBalance = getAccountBalance();

    if (amountNum > accountBalance) {
      toast.error("Insufficient balance");
      return;
    }

    if (amountNum < COINS[selectedCoin].minWithdrawal) {
      toast.error(
        `Minimum withdrawal is ${COINS[selectedCoin].minWithdrawal} ${selectedCoin}`
      );
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update balances using the same pattern as transfer function
      const withdrawalAmountUSDT =
        selectedCoin === "USDT"
          ? amountNum
          : selectedCoin === "BTC"
          ? amountNum * 65000
          : amountNum * 100;

      const newBalance =
        balances[accountType].totalBalanceUSDT - withdrawalAmountUSDT;

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
              action: "Withdraw",
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
              action: "Withdraw",
              amount: amountNum.toFixed(6),
              symbol: selectedCoin,
              txId: generateTxId(),
            },
            ...balances.funding.txs,
          ].slice(0, 10),
        });
      }

      toast.success(
        `Withdrawal of ${amountNum} ${selectedCoin} completed! Balance updated.`
      );
      onClose();
    } catch (error) {
      toast.error("Withdrawal failed");
    } finally {
      setIsLoading(false);
    }
  };

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
            className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#22304A] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-[#2a3b55] scrollbar-thin scrollbar-thumb-[#22304A] scrollbar-track-transparent"
          >
            <Card className="bg-[#081935] border-[#22304A] shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-4 sm:px-6">
                <CardTitle className="text-lg sm:text-xl font-bold text-white">
                  Withdraw {accountType === "trading" ? "Trading" : "Funding"}
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
                  <Select
                    value={selectedCoin}
                    onValueChange={(value) => {
                      setSelectedCoin(value);
                      setSelectedNetwork(""); // Reset network when coin changes
                    }}
                  >
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
                </div>

                {/* Network Selection */}
                {selectedCoin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">
                      Network
                    </label>
                    <Select
                      value={selectedNetwork}
                      onValueChange={setSelectedNetwork}
                    >
                      <SelectTrigger className="bg-[#0c1e4e] border-[#22304A] text-white h-10 sm:h-11">
                        <SelectValue placeholder="Select network" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#081935] border-[#22304A]">
                        {COINS[selectedCoin]?.networks.map((network) => (
                          <SelectItem
                            key={network}
                            value={network}
                            className="text-white hover:bg-[#0c1e4e]"
                          >
                            {network}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Wallet Address Preview */}
                {selectedCoin && selectedNetwork && (
                  <div className="bg-[#22304A]/30 border border-[#22304A] rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {COINS[selectedCoin]?.icon}
                        <span className="text-white text-sm font-medium">
                          {selectedCoin} - {selectedNetwork}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-white/60 text-xs">
                        Your {selectedCoin} address:
                      </span>
                      <div className="flex items-center gap-2 bg-[#081935] px-2 py-1 rounded border border-[#22304A]">
                        <span className="text-white text-sm font-mono">
                          {formatAddressPreview(getCurrentWalletAddress())}
                        </span>
                        <button
                          onClick={() => {
                            const fullAddress = getCurrentWalletAddress();
                            navigator.clipboard.writeText(fullAddress);
                            toast.success("Address copied to clipboard");
                          }}
                          className="text-white/60 hover:text-white transition-colors"
                          title="Copy full address"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-blue-300">
                      💡 This is your receiving address for {selectedCoin} on{" "}
                      {selectedNetwork}
                    </div>
                  </div>
                )}

                {/* Wallet Address */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">
                    Wallet Address
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      onPaste={(e) => {
                        const pastedText = e.clipboardData.getData("text");
                        if (pastedText) {
                          setWalletAddress(pastedText);
                          toast.success("Address pasted from clipboard");
                        }
                      }}
                      placeholder="Enter wallet address"
                      className="bg-[#0c1e4e] border-[#22304A] text-white flex-1 h-10 sm:h-11 text-sm"
                    />
                    <Button
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          if (text && text.trim()) {
                            setWalletAddress(text.trim());
                            toast.success("Address pasted from clipboard");
                          } else {
                            toast.error("No text found in clipboard");
                          }
                        } catch (error) {
                          toast.error("Failed to paste from clipboard");
                        }
                      }}
                      size="sm"
                      variant="outline"
                      className="border-[#22304A] text-[#0c1e4e] hover:bg-[#0c1e4e] hover:text-[#FFF] cursor-pointer px-2 sm:px-3 h-10 sm:h-11"
                      title="Paste from clipboard"
                    >
                      <Copy size={14} className="sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      onClick={startQRScanner}
                      size="sm"
                      variant="outline"
                      className="border-[#22304A] text-[#0c1e4e] hover:bg-[#0c1e4e] hover:text-[#FFF] cursor-pointer px-2 sm:px-3 h-10 sm:h-11"
                    >
                      <QrCode size={14} className="sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>

                {/* Withdrawal Amount Card */}
                <Card className="bg-[#0c1e4e] border-[#22304A]">
                  <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-white/80">
                        Withdrawal Amount
                      </span>
                      <Button
                        onClick={handleMaxAmount}
                        size="sm"
                        variant="outline"
                        className="border-[#0c1e4e] text-[#0c1e4e] hover:bg-[#0c1e4e] hover:text-white text-xs hover:border hover:border-[#FFF] h-7 sm:h-8 px-2 sm:px-3"
                      >
                        Max
                      </Button>
                    </div>

                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="bg-[#081935] border-[#22304A] text-white text-base sm:text-lg h-10 sm:h-11"
                    />

                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Min withdrawal:</span>
                        <span className="text-white">
                          {selectedCoin ? COINS[selectedCoin].minWithdrawal : 0}{" "}
                          {selectedCoin}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Available:</span>
                        <span className="text-white">
                          {getAvailableBalance().toFixed(6)} {selectedCoin}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">
                          {accountType === "trading" ? "Trading" : "Funding"}{" "}
                          Account:
                        </span>
                        <span className="text-white">
                          {getAccountBalance().toFixed(6)} {selectedCoin}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* OTP Verification Card */}
                <AnimatePresence>
                  {isOtpSent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-[#0c1e4e] border-[#22304A]">
                        <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                          <div className="text-center">
                            <h3 className="text-sm font-medium text-white mb-2">
                              Enter OTP Sent to your Email
                            </h3>
                            <div className="flex justify-center gap-2 sm:gap-3">
                              {otp.map((digit, index) => (
                                <Input
                                  key={index}
                                  ref={(el) => {
                                    otpRefs.current[index] = el;
                                  }}
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) =>
                                    handleOtpChange(index, e.target.value)
                                  }
                                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                  onPaste={handleOtpPaste}
                                  className="w-12 h-12 sm:w-14 sm:h-14 text-center text-lg sm:text-xl font-bold bg-[#081935] border-[#22304A] text-white focus:border-[#EC3B3B] focus:ring-1 focus:ring-[#EC3B3B]"
                                />
                              ))}
                            </div>
                            <p className="text-xs text-white/60 mt-2">
                              Enter the 4-digit code sent to your email
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Amount Received */}
                {amount && !isNaN(parseFloat(amount)) && (
                  <Card className="bg-[#0c1e4e] border-[#22304A]">
                    <CardContent className="p-3 sm:p-4 space-y-1.5 sm:space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Amount received:</span>
                        <span className="text-white font-medium">
                          {finalAmount.toFixed(6)} {selectedCoin}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Fee:</span>
                        <span className="text-white">
                          {fee} {selectedCoin}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Warning */}
                {selectedCoin && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div className="text-xs sm:text-sm text-yellow-400">
                      Please ensure you're using the correct network. Wrong
                      network may result in permanent loss of funds.
                    </div>
                  </div>
                )}

                {/* Withdraw Button */}
                <Button
                  onClick={handleWithdraw}
                  disabled={
                    !selectedCoin ||
                    !selectedNetwork ||
                    !walletAddress ||
                    !amount ||
                    !isOtpSent ||
                    otp.join("").length !== 4 ||
                    isLoading
                  }
                  className="w-full bg-[#EC3B3B] hover:bg-[#d02f2f] text-white h-11 sm:h-12 text-sm sm:text-base font-medium"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="hidden sm:inline">Processing...</span>
                      <span className="sm:hidden">Processing</span>
                    </div>
                  ) : (
                    "Withdraw"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* QR Scanner Modal */}
            {showQRScanner && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4"
              >
                <Card className="bg-[#081935] border-[#22304A] w-full max-w-sm sm:w-96">
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-white text-lg sm:text-xl">
                      Scan QR Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-48 sm:h-64 bg-black rounded-lg"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={stopQRScanner}
                        variant="outline"
                        className="flex-1 border-[#22304A] text-white hover:bg-[#0c1e4e] h-10 sm:h-11"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          // Simulate QR code scan result
                          setWalletAddress(
                            "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                          );
                          stopQRScanner();
                          toast.success("Address scanned successfully");
                        }}
                        className="flex-1 bg-[#EC3B3B] hover:bg-[#d02f2f] text-white h-10 sm:h-11"
                      >
                        Simulate Scan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
