"use client";

import { useState, useEffect } from "react";
import TopMovers from "@/components/market-overview/TopMovers";
import MarketStats from "@/components/market-overview/MarketStats";
import MarketCharts from "@/components/market-overview/MarketCharts";
import HistoricalChart from "@/components/market-overview/HistoricalChart";
import {
  CoinData,
  getTopCoins,
  getTopGainers,
  getTopLosers,
  getTopByVolume,
  getTopByMarketCap,
  getPriceChangeDistribution,
  getOrderDistribution,
} from "@/utils/coingecko";
import Navbar from "@/components/shared/Navbar";
import Image from "next/image";
import Footer from "@/components/shared/Footer";
import { useTranslations } from "next-intl";
import PricesTable from "@/components/market-overview/PricesTable";

export default function MarketOverview() {
  const t = useTranslations("marketOverview");
  const [isLoading, setIsLoading] = useState(true);
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getTopCoins(100);
        setCoins(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch market data");
        console.error("Error fetching market data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[#07153b] text-white p-6 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07153b] text-white p-6 flex items-center justify-center">
        <div className="text-slate-400">{t("loading")}</div>
      </div>
    );
  }

  const gainers = getTopGainers(coins);
  const losers = getTopLosers(coins);
  const volumeLeaders = getTopByVolume(coins);
  const marketCapLeaders = getTopByMarketCap(coins);
  const priceDistribution = getPriceChangeDistribution(coins);
  const [buyPercentage, sellPercentage] = getOrderDistribution(coins);

  return (
    <section className="bg-[#07153b]">
      <Navbar />
      <main className="min-h-screen bg-[#07153b] px-4 xl:px-0 text-white py-6 xl:max-w-[70%] mx-auto">
        <div className="flex items-center gap-2 xl:px-0 px-4">
          <Image
            src="/images/market_icon.svg"
            alt="Market Overview"
            width={30}
            height={30}
            className=""
          />
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
        </div>
        <PricesTable />
        <h1 className="text-center text-3xl text-[#FFF] font-semibold mb-4">
          Market Analysis
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Gainers */}
          <TopMovers title={t("topGainers")} type="gainers" data={gainers} />

          {/* Top Losers */}
          <TopMovers title={t("topLosers")} type="losers" data={losers} />

          {/* Value Leaders */}
          <TopMovers
            title={t("valueLeaders")}
            type="volume"
            data={volumeLeaders}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Market Cap */}
          <MarketStats
            title="Market Cap"
            type="market-cap"
            data={marketCapLeaders}
          />

          {/* Market Volume */}
          <MarketStats
            title="Market Volume"
            type="top-search"
            data={volumeLeaders}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Order Distribution */}
          <MarketCharts
            title={t("orderDistribution")}
            type="pie"
            data={[buyPercentage, sellPercentage]}
          />

          {/* Price Change Distribution */}
          <MarketCharts
            title={t("priceChangeDistribution")}
            type="bar"
            data={priceDistribution}
          />
        </div>

        <HistoricalChart title={t("historicalValue")} />
      </main>
      <Footer />
    </section>
  );
}
