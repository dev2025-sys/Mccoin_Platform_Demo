"use client";

import { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import Image from "next/image";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ordersData } from "@/data/orders";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
export default function OrdersHistoryTab() {
  const t = useTranslations("dashboard.orders");
  const isArabic = useLocale() === "ar";
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [filters, setFilters] = useState({
    type: "all",
    market: "all",
    side: "all",
    time: "all",
  });

  const filteredOrders = ordersData.filter((order) => {
    return (
      (filters.market === "all" ||
        order.currency.toLowerCase() === filters.market) &&
      (filters.type === "all" || filters.type === "market") &&
      (filters.side === "all" || filters.side === order.side?.toLowerCase())
    );
  });

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
      ...filteredOrders.map((o) => [
        o.time,
        o.currency,
        o.amount,
        o.network,
        o.blockConfirmation,
        o.depositAddress,
        o.transactionId,
        o.depositId,
        o.state,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "orders_export.csv";
    link.click();
  };
  const clearFilters = () => {
    setFilters({ type: "all", market: "all", side: "all", time: "all" });
    setDate(new Date());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-[#081935] border-[0.5px] rounded-md border-[#DAE6EA]">
        <CardHeader>
          <CardTitle className="text-white text-xl font-semibold">
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 text-[#DAE6EA]">
            <div className="flex items-center gap-2">
              <span className="text-sm">{t("filters.orderType")}</span>
              <Select
                onValueChange={(value) =>
                  setFilters({ ...filters, type: value })
                }
              >
                <SelectTrigger className="w-[110px] bg-[#0f294d] text-white border border-[#DAE6EA]">
                  <SelectValue placeholder={t("filters.all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.all")}</SelectItem>
                  <SelectItem value="limit">{t("filters.limit")}</SelectItem>
                  <SelectItem value="market">{t("filters.market")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">{t("filters.market")}</span>
              <Select
                onValueChange={(value) =>
                  setFilters({ ...filters, market: value })
                }
              >
                <SelectTrigger className="w-[110px] bg-[#0f294d] text-white border border-[#DAE6EA]">
                  <SelectValue placeholder={t("filters.all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.all")}</SelectItem>
                  <SelectItem value="btc">BTC</SelectItem>
                  <SelectItem value="eth">ETH</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">{t("filters.side")}</span>
              <Select
                onValueChange={(value) =>
                  setFilters({ ...filters, side: value })
                }
              >
                <SelectTrigger className="w-[110px] bg-[#0f294d] text-white border border-[#DAE6EA]">
                  <SelectValue placeholder={t("filters.all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.all")}</SelectItem>
                  <SelectItem value="buy">{t("filters.buy")}</SelectItem>
                  <SelectItem value="sell">{t("filters.sell")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">{t("filters.time")}</span>
              <Select
                onValueChange={(value) =>
                  setFilters({ ...filters, time: value })
                }
              >
                <SelectTrigger className="w-[110px] bg-[#0f294d] text-white border border-[#DAE6EA]">
                  <SelectValue placeholder={t("filters.all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.all")}</SelectItem>
                  <SelectItem value="24h">{t("filters.24h")}</SelectItem>
                  <SelectItem value="7d">{t("filters.7d")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Button
                variant="outline"
                className="flex gap-2 bg-[#0f294d] text-white border border-slate-500"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <CalendarIcon size={16} />
                {date ? format(date, "dd MMM yyyy") : "Pick a date"}
              </Button>
              {showCalendar && (
                <div className="absolute z-50 mt-2 rounded-md shadow-lg bg-[#0f294d] p-2 border border-slate-600">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      setDate(d);
                      setShowCalendar(false);
                    }}
                    className="rounded-md bg-[#081935] text-white border border-slate-600"
                  />
                </div>
              )}
            </div>
            <Button
              onClick={clearFilters}
              variant="outline"
              className="text-red-600 border border-red-400  hover:bg-white hover:text-[#081935]"
            >
              {t("filters.clear")}
            </Button>
            <Button
              onClick={handleExport}
              variant="ghost"
              className="text-red-500 border border-red-500 hover:bg-red-600 hover:text-white"
            >
              {t("filters.export")}
            </Button>
          </div>

          {/* Table or Empty State */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <Image
                src="/images/nothing-here.svg"
                alt="Nothing here"
                width={300}
                height={100}
                className="mx-auto mb-4"
              />
              <p className="text-[#DAE6EA] text-lg">{t("empty.message")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-white">
                <thead className="text-[#DAE6EA]/80 font-light">
                  <tr className="font-light">
                    <th
                      className={`text-left py-2 font-light ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {t("table.time")}
                    </th>
                    <th
                      className={`text-left py-2 font-light ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {t("table.currency")}
                    </th>
                    <th
                      className={`text-left py-2 font-light ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {t("table.amount")}
                    </th>
                    <th
                      className={`text-left py-2 font-light ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {t("table.network")}
                    </th>
                    <th
                      className={`text-left py-2 font-light ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {t("table.blockConfirmation")}
                    </th>
                    <th
                      className={`text-left py-2 font-light ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {t("table.depositAddress")}
                    </th>
                    <th
                      className={`text-left py-2 font-light ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {t("table.transactionId")}
                    </th>
                    <th
                      className={`text-left py-2 font-light ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {t("table.depositId")}
                    </th>
                    <th
                      className={`text-left py-2 font-light ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {t("table.state")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((entry, idx) => (
                    <tr key={idx} className="border-t border-[#0f294d]">
                      <td className="py-2">{entry.time}</td>
                      <td>{entry.currency}</td>
                      <td>{entry.amount}</td>
                      <td>{entry.network}</td>
                      <td>{entry.blockConfirmation}</td>
                      <td>{entry.depositAddress}</td>
                      <td>{entry.transactionId}</td>
                      <td>{entry.depositId}</td>
                      <td>{entry.state}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
