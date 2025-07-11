"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Star,
  StarOff,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";

interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  price: number;
  percent_change_1h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  market_cap: number;
  volume_24h: number;
  circulating_supply: number;
  sparkline_7d: number[];
}

type SortKey = keyof Coin;

// Change wishlist to store coin objects
interface WishlistCoin {
  id: string;
  name: string;
  image: string;
  price: number;
  percent_change_24h: number;
}

export default function PricesTable() {
  const { isSignedIn } = useAuth();
  const locale = (useParams() as { locale?: string })?.locale ?? "en";
  const [coins, setCoins] = useState<Coin[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>("market_cap");
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const coinsPerPage = 10;
  const [wishlist, setWishlist] = useState<WishlistCoin[]>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("coinWishlist") || "[]");
    }
    return [];
  });

  useEffect(() => {
    fetch(`/api/prices_table`)
      .then((res) => res.json())
      .then(setCoins)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem("coinWishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (coin: Coin) => {
    const isInWishlist = wishlist.some((c) => c.id === coin.id);
    setWishlist((prev) => {
      if (isInWishlist) {
        return prev.filter((c) => c.id !== coin.id);
      } else {
        return [
          ...prev,
          {
            id: coin.id,
            name: coin.name,
            image: coin.image,
            price: coin.price,
            percent_change_24h: coin.percent_change_24h,
          },
        ];
      }
    });
    if (isInWishlist) {
      toast.error(`${coin.name} removed from wishlist`);
    } else {
      toast.success(`${coin.name} added to wishlist!`);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(key);
      setSortAsc(true);
    }
  };

  const format = (num: number, decimals = 2) =>
    Intl.NumberFormat("en-US", { maximumFractionDigits: decimals }).format(num);

  const filteredCoins = coins.filter((coin) =>
    Object.values(coin).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const sortedCoins = [...filteredCoins].sort((a: any, b: any) => {
    const aVal = a[sortBy] ?? 0;
    const bVal = b[sortBy] ?? 0;
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  const totalPages = Math.ceil(sortedCoins.length / coinsPerPage);
  const paginatedCoins = sortedCoins.slice(
    (currentPage - 1) * coinsPerPage,
    currentPage * coinsPerPage
  );

  return (
    <section className="mx-auto py-8 px-4 xl:px-0 flex lg:flex-row flex-col gap-2">
      <div className="lg:flex-[3]">
        <div className="flex justify-start items-center">
          <Input
            placeholder="Search any column..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="mb-4 border-[#DAE6EA]  text-[#DAE6EA]  font-medium placeholder:text-[#DAE6EA] w-[200px]"
          />
        </div>
        <Card className="overflow-x-auto rounded-2xl shadow-xl bg-[#050E27]  px-4 border-none border">
          <table className="min-w-full table-auto text-sm text-[#DAE6EA] ">
            <thead>
              <tr className="text-left">
                {[
                  { key: "name", label: "Name" },
                  { key: "price", label: "Price" },
                  { key: "percent_change_1h", label: "1h %" },
                  { key: "percent_change_24h", label: "24h %" },
                  { key: "percent_change_7d", label: "7d %" },
                  // { key: "market_cap", label: "Market Cap" },
                  // { key: "volume_24h", label: "Volume(24h)" },
                  // { key: "circulating_supply", label: "Circulating Supply" },
                  { key: "sparkline_7d", label: "Last 7 Days" },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    className="py-4 px-2 cursor-pointer select-none"
                    onClick={() => handleSort(key as SortKey)}
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      <ArrowUpDown
                        className={cn(
                          "w-4 h-4 transition-colors",
                          sortBy === key
                            ? sortAsc
                              ? "text-green-400"
                              : "text-red-400"
                            : "text-[#DAE6EA]/50"
                        )}
                      />
                    </div>
                  </th>
                ))}
                <th className="py-4 px-2 select-none">Wishlist</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: coinsPerPage }).map((_, i) => (
                    <tr key={i} className="border-t border-[#DAE6EA]/10">
                      {Array.from({ length: 9 }).map((__, j) => (
                        <td key={j} className="p-2">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                      <td className="p-2">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    </tr>
                  ))
                : paginatedCoins.map((coin) => (
                    <tr
                      key={coin.id}
                      className="border-t border-[#DAE6EA]/10 hover:bg-[#EC3B3B]/10 transition-colors h-12"
                    >
                      <td className="flex items-center gap-2 py-2 px-2 max-w-[160px]">
                        <img
                          src={coin.image}
                          alt={coin.name}
                          className="w-5 h-5"
                        />
                        <span className="font-semibold truncate max-w-[100px]">
                          {coin.name.length > 16
                            ? `${coin.name.slice(0, 16)}...`
                            : coin.name}
                        </span>
                        <span className="uppercase text-xs dark:text-[#DAE6EA]/70 text-[#07153b]">
                          {coin.symbol}
                        </span>
                      </td>
                      <td>${format(coin.price)}</td>
                      <td
                        className={cn(
                          coin.percent_change_1h >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        )}
                      >
                        {coin.percent_change_1h?.toFixed(2)}%
                      </td>
                      <td
                        className={cn(
                          coin.percent_change_24h >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        )}
                      >
                        {coin.percent_change_24h?.toFixed(2)}%
                      </td>
                      <td
                        className={cn(
                          coin.percent_change_7d >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        )}
                      >
                        {coin.percent_change_7d?.toFixed(2)}%
                      </td>
                      {/* <td>${format(coin.market_cap, 0)}</td>
                      <td>${format(coin.volume_24h, 0)}</td>
                      <td>{format(coin.circulating_supply, 0)}</td> */}
                      <td>
                        <Sparkline
                          prices={coin.sparkline_7d}
                          positive={coin.percent_change_7d >= 0}
                        />
                      </td>
                      <td className="p-2 text-center">
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={() => toggleWishlist(coin)}
                          aria-label={
                            wishlist.some((c) => c.id === coin.id)
                              ? "Remove from wishlist"
                              : "Add to wishlist"
                          }
                          className="focus:outline-none"
                        >
                          {wishlist.some((c) => c.id === coin.id) ? (
                            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                          ) : (
                            <Star className="w-6 h-6 text-[#DAE6EA]" />
                          )}
                        </motion.button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </Card>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center mt-6 gap-6 text-[#DAE6EA]">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="flex items-center gap-2 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="flex items-center gap-2 disabled:opacity-40 cursor-pointer"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="lg:flex-[1.5]">
        <CoinsWishlistTable wishlist={wishlist} loading={loading} />
      </div>
    </section>
  );
}

function Sparkline({
  prices,
  positive,
}: {
  prices: number[];
  positive: boolean;
}) {
  const max = Math.max(...prices);
  const min = Math.min(...prices);
  const height = 40;

  const points = prices
    .map(
      (p, i) =>
        `${(i / prices.length) * 100},${
          height - ((p - min) / (max - min)) * height
        }`
    )
    .join(" ");

  return (
    <motion.svg width="100" height={height}>
      <motion.polyline
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        fill="none"
        stroke={positive ? "green" : "#EC3B3B"}
        strokeWidth="2"
        points={points}
      />
    </motion.svg>
  );
}

function CoinsWishlistTable({
  wishlist,
  loading,
}: {
  wishlist: WishlistCoin[];
  loading: boolean;
}) {
  // Filter out invalid entries
  const validWishlist = wishlist.filter(
    (coin) => coin && typeof coin.name === "string"
  );
  return (
    <div id="coin_wishlist_container" className="mt-13">
      <Card className="overflow-x-auto rounded-2xl shadow-xl bg-[#050E27] px-4 border-none border">
        <h1 className="text-center text-[#FFF] font-semibold italic">
          Coins Wishlist
        </h1>
        <table className="min-w-full table-auto text-sm text-[#DAE6EA] ">
          <thead>
            <tr className="text-left">
              <th className="py-4 px-2 select-none">Name</th>
              <th className="py-4 px-2 select-none">Price</th>
              <th className="py-4 px-2 select-none text-center">24H%</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-[#DAE6EA]/10">
                  <td className="p-2">
                    <Skeleton className="h-4 w-full" />
                  </td>
                  <td className="p-2">
                    <Skeleton className="h-4 w-full" />
                  </td>
                  <td className="p-2">
                    <Skeleton className="h-4 w-full" />
                  </td>
                </tr>
              ))
            ) : validWishlist.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-6 text-[#DAE6EA]/60">
                  No coins in wishlist.
                </td>
              </tr>
            ) : (
              validWishlist.map((coin) => (
                <tr
                  key={coin.id}
                  className="border-t border-[#DAE6EA]/10 hover:bg-[#EC3B3B]/10 transition-colors h-12"
                >
                  <td className="flex items-center gap-2 py-2 px-2 max-w-[160px]">
                    <img
                      src={coin.image}
                      alt={coin.name || "coin"}
                      className="w-5 h-5"
                    />
                    <span className="font-semibold truncate max-w-[100px]">
                      {coin.name && coin.name.length > 16
                        ? `${coin.name.slice(0, 16)}...`
                        : coin.name || ""}
                    </span>
                  </td>
                  <td>
                    $
                    {coin.price?.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td
                    className={
                      coin.percent_change_24h >= 0
                        ? "text-green-400 text-center"
                        : "text-red-400 text-center"
                    }
                  >
                    {typeof coin.percent_change_24h === "number"
                      ? coin.percent_change_24h.toFixed(2) + "%"
                      : ""}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
