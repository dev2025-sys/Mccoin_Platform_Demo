"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiDownload, FiCalendar, FiChevronDown, FiX } from "react-icons/fi";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
const currencies = [
  "BTC",
  "ETH",
  "USDT",
  "SOL",
  "BNB",
  "XRP",
  "ADA",
  "DOGE",
  "DOT",
  "MATIC",
];
const networks = [
  "Bitcoin",
  "Ethereum",
  "Tron",
  "Solana",
  "BNB Chain",
  "Polygon",
];
const states = ["Completed", "Pending", "Failed"];

const dummyData = Array.from({ length: 15 }, (_, i) => ({
  id: `DEP${1000 + i}`,
  time: new Date(
    Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
  ).toISOString(),
  currency: currencies[Math.floor(Math.random() * currencies.length)],
  amount: (Math.random() * 10).toFixed(6),
  network: networks[Math.floor(Math.random() * networks.length)],
  confirmations: Math.floor(Math.random() * 50),
  address: `0x${Math.random().toString(16).substr(2, 40)}`,
  txId: `0x${Math.random().toString(16).substr(2, 64)}`,
  state: states[Math.floor(Math.random() * states.length)],
}));

const RecordsTab = () => {
  const [selectedAsset, setSelectedAsset] = useState("All");
  const [selectedTime, setSelectedTime] = useState("Last 30 days");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const t = useTranslations("dashboard.records");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const time = [
    t("last30Days"),
    t("last60Days"),
    t("last90Days"),
    t("all"),
    t("selectDate"),
  ];
  type Deposit = {
    id: string;
    time: string;
    currency: string;
    amount: string;
    network: string;
    confirmations: number;
    address: string;
    txId: string;
    state: string;
  };

  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [filteredDeposits, setFilteredDeposits] = useState<Deposit[]>([]);

  useEffect(() => {
    setDeposits(dummyData);
    setFilteredDeposits(dummyData);
  }, []);

  // Filter deposits based on selections
  useEffect(() => {
    let filtered = [...deposits];

    // Filter by asset
    if (selectedAsset !== "All") {
      filtered = filtered.filter(
        (deposit) => deposit.currency === selectedAsset
      );
    }

    // Filter by time
    const now = new Date();
    let cutoffDate = new Date();

    switch (selectedTime) {
      case "Last 30 days":
        cutoffDate.setDate(now.getDate() - 30);
        filtered = filtered.filter(
          (deposit) => new Date(deposit.time) >= cutoffDate
        );
        break;
      case "Last 60 days":
        cutoffDate.setDate(now.getDate() - 60);
        filtered = filtered.filter(
          (deposit) => new Date(deposit.time) >= cutoffDate
        );
        break;
      case "Last 90 days":
        cutoffDate.setDate(now.getDate() - 90);
        filtered = filtered.filter(
          (deposit) => new Date(deposit.time) >= cutoffDate
        );
        break;
      case "Select date":
        if (startDate && endDate) {
          filtered = filtered.filter((deposit) => {
            const depositDate = new Date(deposit.time);
            return depositDate >= startDate && depositDate <= endDate;
          });
        }
        break;
      default: // "All" - no time filter
    }

    setFilteredDeposits(filtered);
  }, [selectedAsset, selectedTime, startDate, endDate, deposits]);

  const handleExport = () => {
    const csv = [
      [
        "Time",
        "Currency",
        "Amount",
        "Network",
        "Block Confirmation",
        "Deposit Address",
        "Transaction ID",
        "Deposit ID",
        "State",
      ],
      ...filteredDeposits.map((d) => [
        formatDate(d.time),
        d.currency,
        d.amount,
        d.network,
        d.confirmations,
        d.address,
        d.txId,
        d.id,
        d.state,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `deposits_export_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStateColor = (state: string): string => {
    const stateColorMap: Record<string, string> = {
      Completed: "text-green-500",
      Pending: "text-yellow-500",
      Failed: "text-red-500",
    };
    return stateColorMap[state] || "text-gray-500";
  };

  const clearDates = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-[#07153B] rounded-lg shadow-xl border-[0.5px] border-[#DAE6EA]"
    >
      <div className="flex flex-col space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Asset Filter */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[#DAE6EA] whitespace-nowrap">
              {t("asset")}
            </label>
            <div className="relative flex-grow">
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="appearance-none bg-[#07153B] border border-[#DAE6EA] rounded-lg px-4 py-1 pr-8 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-100 w-full text-[#DAE6EA]"
              >
                <option value="All">{t("all")}</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="USDT">USDT</option>
                <option value="SOL">SOL</option>
                <option value="BNB">BNB</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#DAE6EA]" />
            </div>
          </div>

          {/* Time Filter */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[#DAE6EA] whitespace-nowrap">
              {t("time")}
            </label>
            <div className="relative flex-grow">
              <select
                value={selectedTime}
                onChange={(e) => {
                  setSelectedTime(e.target.value);
                  setShowDatePicker(e.target.value === "Select date");
                }}
                className="appearance-none bg-[#07153B] border border-[#DAE6EA] rounded-lg px-4 py-1 pr-8 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 w-full text-[#DAE6EA]"
              >
                {time.map((t, idx) => (
                  <option key={idx}>{t}</option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#DAE6EA]" />
            </div>
          </div>

          {/* Date Picker */}
          <AnimatePresence>
            {showDatePicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-end gap-4"
              >
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] justify-start text-left font-normal bg-[#07153B] border-[#DAE6EA] hover:text-[#FFF] hover:bg-[#0a1f4d] text-[#DAE6EA]",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <FiCalendar className="mr-2 h-4 w-4 text-[#DAE6EA]" />
                        {startDate ? (
                          format(startDate, "PPP")
                        ) : (
                          <span>{t("startDate")}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#07153B] border-[#DAE6EA]">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="text-[#DAE6EA]"
                      />
                    </PopoverContent>
                  </Popover>

                  <span className="text-[#DAE6EA]">to</span>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] justify-start text-left font-normal bg-[#07153B] border-[#DAE6EA] hover:text-[#FFF] hover:bg-[#0a1f4d] text-[#DAE6EA]",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <FiCalendar className="mr-2 h-4 w-4 text-[#DAE6EA]" />
                        {endDate ? (
                          format(endDate, "PPP")
                        ) : (
                          <span>{t("endDate")}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#07153B] border-[#DAE6EA]">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="text-[#DAE6EA]"
                      />
                    </PopoverContent>
                  </Popover>

                  {(startDate || endDate) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearDates}
                      className="text-[#DAE6EA] hover:text-red-500"
                    >
                      <FiX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Export Button */}
          <div className="ml-auto self-end">
            <Button
              onClick={handleExport}
              className="flex items-center gap-2 bg-red-500 hover:bg-[#07153B] 
              text-white border border-[#DAE6EA] transition-all duration-300 hover:scale-95 cursor-pointer"
            >
              <FiDownload className="h-4 w-4" />
              {t("exportCSV")}
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredDeposits.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium text-[#DAE6EA] uppercase tracking-wider ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {t("table.time")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#DAE6EA] uppercase tracking-wider">
                    {t("table.currency")}
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium text-[#DAE6EA] uppercase tracking-wider ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {t("table.amount")}
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium text-[#DAE6EA] uppercase tracking-wider ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {t("table.network")}
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium text-[#DAE6EA] uppercase tracking-wider ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {t("table.blockConfirmation")}
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium text-[#DAE6EA] uppercase tracking-wider ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {t("table.depositAddress")}
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium text-[#DAE6EA] uppercase tracking-wider ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {t("table.transactionId")}
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium text-[#DAE6EA] uppercase tracking-wider ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {t("table.depositId")}
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium text-[#DAE6EA] uppercase tracking-wider ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {t("table.state")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#07153B] divide-y divide-gray-700">
                {filteredDeposits.map((deposit, index) => (
                  <motion.tr
                    key={deposit.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-800/50"
                  >
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-[#DAE6EA] ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {formatDate(deposit.time)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-[#DAE6EA] ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {deposit.currency}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-[#DAE6EA] ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {deposit.amount}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-[#DAE6EA] ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {deposit.network}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-[#DAE6EA] ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {deposit.confirmations}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-blue-400 hover:underline cursor-pointer ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {`${deposit.address.substring(
                        0,
                        6
                      )}...${deposit.address.substring(
                        deposit.address.length - 4
                      )}`}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-blue-400 hover:underline cursor-pointer ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {`${deposit.txId.substring(
                        0,
                        6
                      )}...${deposit.txId.substring(deposit.txId.length - 4)}`}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-[#DAE6EA] ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {deposit.id}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getStateColor(
                        deposit.state
                      )} ${isArabic ? "text-right" : "text-left"}`}
                    >
                      {t(`states.${deposit.state.toLowerCase()}`)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-[#DAE6EA]"
            >
              <div className="text-xl mb-2">{t("empty.title")}</div>
              <div className="text-sm">{t("empty.desc")}</div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RecordsTab;
