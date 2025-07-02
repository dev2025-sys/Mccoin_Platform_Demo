"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// Dummy data for withdraw records
const withdrawRecords = [
  {
    id: 1,
    asset: "BTC",
    amount: "0.25",
    fee: "0.0001",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    network: "Bitcoin Network",
    status: "Completed",
    date: "2024-03-15 14:30",
  },
  {
    id: 2,
    asset: "ETH",
    amount: "2.5",
    fee: "0.002",
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    network: "Ethereum Network",
    status: "Processing",
    date: "2024-03-15 13:15",
  },
  {
    id: 3,
    asset: "USDT",
    amount: "1000",
    fee: "1",
    address: "TXFBqBbqJommqZf7BV8NNYzePh97UmJodJ",
    network: "TRC20",
    status: "Completed",
    date: "2024-03-14 19:45",
  },
  {
    id: 4,
    asset: "SOL",
    amount: "45.75",
    fee: "0.01",
    address: "DRpbCBMxVnDK7maPGXqZeGT6GUPMpwNfJXKv1VNmkzsr",
    network: "Solana Network",
    status: "Completed",
    date: "2024-03-14 16:20",
  },
  {
    id: 5,
    asset: "BNB",
    amount: "12.35",
    fee: "0.001",
    address: "bnb1jxfh2g85q3v0tdq56fnevx6xcxtcnhtsmcu64m",
    network: "BNB Smart Chain",
    status: "Failed",
    date: "2024-03-14 12:10",
  },
  {
    id: 6,
    asset: "ETH",
    amount: "1.75",
    fee: "0.002",
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    network: "Arbitrum",
    status: "Completed",
    date: "2024-03-14 10:45",
  },
  {
    id: 7,
    asset: "USDT",
    amount: "5000",
    fee: "1",
    address: "0x8Ba1f109551bD432803012645Ac136ddd64DBA72",
    network: "Ethereum (ERC20)",
    status: "Processing",
    date: "2024-03-13 22:30",
  },
  {
    id: 8,
    asset: "BTC",
    amount: "0.15",
    fee: "0.0001",
    address: "bc1q9d8u7xa7p4zp7x3f7q7mmkuhxf3ussd457e2xw",
    network: "Bitcoin Network",
    status: "Failed",
    date: "2024-03-13 20:15",
  },
  {
    id: 9,
    asset: "SOL",
    amount: "120.5",
    fee: "0.01",
    address: "5KtTk8yFZtJ1hqPzqyxZtQs6CbZrEQVhKKAqNBqxj1Tx",
    network: "Solana Network",
    status: "Completed",
    date: "2024-03-13 18:40",
  },
  {
    id: 10,
    asset: "BNB",
    amount: "8.45",
    fee: "0.001",
    address: "bnb1v8vkkymvhe2sf7gd2092ujc6hweta38xnc4wpr",
    network: "BNB Smart Chain",
    status: "Completed",
    date: "2024-03-13 15:20",
  },
  {
    id: 11,
    asset: "ETH",
    amount: "4.2",
    fee: "0.002",
    address: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",
    network: "Optimism",
    status: "Processing",
    date: "2024-03-13 12:50",
  },
  {
    id: 12,
    asset: "USDT",
    amount: "2500",
    fee: "1",
    address: "TNPeeaaFB7K9cmo4uQpcU32zHq5k3MxLEG",
    network: "TRC20",
    status: "Completed",
    date: "2024-03-13 10:15",
  },
  {
    id: 13,
    asset: "BTC",
    amount: "0.08",
    fee: "0.0001",
    address: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
    network: "Bitcoin Network",
    status: "Completed",
    date: "2024-03-12 23:40",
  },
  {
    id: 14,
    asset: "SOL",
    amount: "85.25",
    fee: "0.01",
    address: "7Np5KCwpUZnVU6VtGBVmp3Nxv5eGHxqjx9Muyrz9wTxe",
    network: "Solana Network",
    status: "Failed",
    date: "2024-03-12 21:10",
  },
  {
    id: 15,
    asset: "BNB",
    amount: "15.8",
    fee: "0.001",
    address: "bnb1s7kx0g8hcjxg9j9vjg0hj8e6u52jt2n7njqxmn",
    network: "BNB Smart Chain",
    status: "Completed",
    date: "2024-03-12 18:30",
  },
];

const assets = ["All", "BTC", "ETH", "USDT", "SOL", "BNB"];
const statuses = ["All", "Completed", "Processing", "Failed"];

export default function WithdrawRecordsPage() {
  const [selectedAsset, setSelectedAsset] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [date, setDate] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecords = withdrawRecords.filter((record) => {
    const matchesAsset =
      selectedAsset === "All" || record.asset === selectedAsset;
    const matchesStatus =
      selectedStatus === "All" || record.status === selectedStatus;
    const matchesDate =
      !date || record.date.startsWith(format(date, "yyyy-MM-dd"));
    const matchesSearch =
      searchQuery === "" ||
      record.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.network.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesAsset && matchesStatus && matchesDate && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto py-6 space-y-6"
    >
      <h1 className="text-2xl font-bold text-[#FFF] mb-6">Withdraw Records</h1>

      <Card className="bg-[#081935] shadow-2xl border-[0.5px] rounded-md border-[#DAE6EA]">
        <CardHeader>
          <CardTitle className="text-lg text-white">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Asset Filter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#DAE6EA]">
                  Asset:
                </label>
              </div>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger className="bg-[#0f294d] text-white border border-[#DAE6EA]">
                  <SelectValue placeholder="Select Asset" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f294d] text-white">
                  {assets.map((asset) => (
                    <SelectItem key={asset} value={asset}>
                      {asset}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#DAE6EA]">
                  Status:
                </label>
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="bg-[#0f294d] text-white border border-[#DAE6EA]">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f294d] text-white">
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#DAE6EA]">
                  Date:
                </label>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-[#0f294d] text-white border border-[#DAE6EA]",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#0f294d] text-white border border-[#DAE6EA]">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="bg-[#0f294d]"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Search */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#DAE6EA]">
                  Search:
                </label>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#DAE6EA]" />
                <Input
                  placeholder="Search address or network"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#0f294d] text-white border border-[#DAE6EA] pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#081935] shadow-2xl border-[0.5px] rounded-md border-[#DAE6EA]">
        <CardContent className="p-6">
          <div className="rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#DAE6EA]">
                  <TableHead className="text-[#DAE6EA]">Asset</TableHead>
                  <TableHead className="text-[#DAE6EA]">Amount</TableHead>
                  <TableHead className="text-[#DAE6EA]">Network Fee</TableHead>
                  <TableHead className="text-[#DAE6EA]">
                    Wallet Address
                  </TableHead>
                  <TableHead className="text-[#DAE6EA]">Network</TableHead>
                  <TableHead className="text-[#DAE6EA]">Status</TableHead>
                  <TableHead className="text-[#DAE6EA]">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow
                    key={record.id}
                    className="border-b border-[#0f294d]"
                  >
                    <TableCell className="text-white">{record.asset}</TableCell>
                    <TableCell className="text-white">
                      {record.amount}
                    </TableCell>
                    <TableCell className="text-white">{record.fee}</TableCell>
                    <TableCell className="text-white font-mono">
                      {record.address}
                    </TableCell>
                    <TableCell className="text-white">
                      {record.network}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs",
                          record.status === "Completed" &&
                            "bg-green-500/20 text-green-500",
                          record.status === "Processing" &&
                            "bg-yellow-500/20 text-yellow-500",
                          record.status === "Failed" &&
                            "bg-red-500/20 text-red-500"
                        )}
                      >
                        {record.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-white">{record.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
