import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type Time,
  CandlestickSeries,
} from "lightweight-charts";
import { useTrading } from "@/context/TradingContext";
import { useTranslations } from "next-intl";

interface TradingChartProps {
  height?: number;
}

const TradingChart: React.FC<TradingChartProps> = ({ height = 400 }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const { state, setTimeframe } = useTrading();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const t = useTranslations("spot.tradingChart");
  useEffect(() => {
    if (state.currentPrice.timestamp) {
      setLastUpdate(
        new Date(state.currentPrice.timestamp).toLocaleTimeString()
      );
    }
  }, [state.currentPrice.timestamp]);

  // Helper function to align timestamp to timeframe interval
  const alignTimestampToInterval = (
    timestamp: number,
    timeframe: string
  ): number => {
    const intervals = {
      "5m": 5 * 60,
      "15m": 15 * 60,
      "1h": 60 * 60,
      "4h": 4 * 60 * 60,
      "1d": 24 * 60 * 60,
    };

    const interval =
      intervals[timeframe as keyof typeof intervals] || intervals["5m"];
    return Math.floor(timestamp / interval) * interval;
  };

  // Generate realistic candlestick data
  const generateCandlestickData = (
    timeframe: string,
    currentPrice: number
  ): CandlestickData[] => {
    const data: CandlestickData[] = [];
    const now = new Date();
    const intervals = {
      "5m": 5 * 60 * 1000,
      "15m": 15 * 60 * 1000,
      "1h": 60 * 60 * 1000,
      "4h": 4 * 60 * 60 * 1000,
      "1d": 24 * 60 * 60 * 1000,
    };

    const interval =
      intervals[timeframe as keyof typeof intervals] || intervals["5m"];
    const count = 50; // Reduced number of candles for testing

    let basePrice = currentPrice - Math.random() * 1000;

    // Generate data points from oldest to newest
    for (let i = count; i >= 0; i--) {
      const timestamp = Math.floor(now.getTime() / 1000);
      const alignedTime = alignTimestampToInterval(
        timestamp - i * (interval / 1000),
        timeframe
      );

      const volatility = currentPrice * 0.02;
      const trend = (Math.random() - 0.5) * 0.01;

      const open = basePrice;
      const high = open + Math.random() * volatility;
      const low = open - Math.random() * volatility;
      const close =
        open + (Math.random() - 0.5) * volatility + trend * volatility;

      const maxPrice = Math.max(open, high, low, close);
      const minPrice = Math.min(open, high, low, close);

      data.push({
        time: alignedTime as Time,
        open: Math.max(open, 1000),
        high: Math.max(maxPrice, 1000),
        low: Math.max(minPrice, 1000),
        close: Math.max(close, 1000),
      });

      basePrice = close;
    }

    return data.sort((a, b) => Number(a.time) - Number(b.time));
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: isFullscreen ? window.innerHeight - 100 : height,
      layout: {
        background: { color: "#0f172a" },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { color: "#334155" },
        horzLines: { color: "#334155" },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: "#334155",
      },
      timeScale: {
        borderColor: "#334155",
        timeVisible: true,
        secondsVisible: false,
        // Custom time formatter for HH:MM format
        tickMarkFormatter: (time: number, tickMarkType: number, locale: string) => {
          const date = new Date(time * 1000);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        },
      },
      // Add locale options for 24-hour time format
      localization: {
        timeFormatter: (time: number) => {
          const date = new Date(time * 1000);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        },
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderDownColor: "#ef4444",
      borderUpColor: "#10b981",
      wickDownColor: "#ef4444",
      wickUpColor: "#10b981",
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Set initial data
    const initialData = generateCandlestickData(
      state.chartTimeframe,
      state.currentPrice.price
    );
    candlestickSeries.setData(initialData);

    // Store the last timestamp for updates
    const lastDataPoint = initialData[initialData.length - 1];
    if (lastDataPoint) {
      candlestickSeries.update({
        time: lastDataPoint.time,
        open: lastDataPoint.close,
        high: lastDataPoint.close,
        low: lastDataPoint.close,
        close: lastDataPoint.close,
      });
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: isFullscreen ? window.innerHeight - 100 : height,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [height, isFullscreen, state.chartTimeframe]);

  // Update chart with new price data
  useEffect(() => {
    if (!candlestickSeriesRef.current || !state.currentPrice.timestamp) return;

    const rawTimestamp = Math.floor(state.currentPrice.timestamp / 1000);
    const alignedTimestamp = alignTimestampToInterval(
      rawTimestamp,
      state.chartTimeframe
    );
    const currentPrice = state.currentPrice.price;

    try {
      candlestickSeriesRef.current.update({
        time: alignedTimestamp as Time,
        open: currentPrice,
        high: currentPrice,
        low: currentPrice,
        close: currentPrice,
      });
    } catch (error) {
      console.error("Failed to update chart:", error);
      // If update fails, try to reinitialize with new data
      if (candlestickSeriesRef.current) {
        const newData = generateCandlestickData(
          state.chartTimeframe,
          currentPrice
        );
        candlestickSeriesRef.current.setData(newData);
      }
    }
  }, [
    state.currentPrice.price,
    state.currentPrice.timestamp,
    state.chartTimeframe,
  ]);

  const timeframes = [
    { key: "5m", label: "5m" },
    { key: "15m", label: "15m" },
    { key: "1h", label: "1h" },
    { key: "4h", label: "4h" },
    { key: "1d", label: "1d" },
  ] as const;

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`bg-[#07153b] rounded-lg p-4 ${
        isFullscreen ? "fixed inset-0 z-50" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <span>{t("title")}</span>
          {state.isConnected && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </h3>
        <div className="flex items-center space-x-4">
          {/* Timeframe selector */}
          <div className="flex space-x-2 text-sm">
            {timeframes.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTimeframe(key)}
                className={`px-2 py-1 rounded transition-colors ${
                  state.chartTimeframe === key
                    ? "bg-orange-500 text-white"
                    : "text-gray-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Chart type selector */}
          <div className="flex space-x-2 text-sm">
            <span className="text-orange-500">
              {t("chartTypes.candlesticks")}
            </span>
            <span className="text-gray-400">{t("chartTypes.line")}</span>
            <span className="text-gray-400">{t("chartTypes.area")}</span>
          </div>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="text-gray-400 hover:text-white p-1"
          >
            {isFullscreen ? t("fullscreen.exit") : t("fullscreen.enter")}
          </button>
        </div>
      </div>

      {/* Price info bar */}
      <div className="flex items-center space-x-6 mb-4 text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">{t("priceInfo.o")}:</span>
          <span className="text-white">
            {(state.currentPrice.price - 50).toFixed(2)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">{t("priceInfo.h")}:</span>
          <span className="text-white">
            {state.currentPrice.high24h.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">{t("priceInfo.l")}:</span>
          <span className="text-white">
            {state.currentPrice.low24h.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">{t("priceInfo.c")}:</span>
          <span
            className={
              state.currentPrice.change24h >= 0
                ? "text-green-400"
                : "text-red-400"
            }
          >
            {state.currentPrice.price.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">{t("priceInfo.vol")}:</span>
          <span className="text-white">
            {state.currentPrice.volume24h.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Chart container */}
      <div
        ref={chartContainerRef}
        className="w-full bg-slate-900 rounded-lg"
        style={{ height: isFullscreen ? "calc(100vh - 200px)" : height }}
      />

      {/* Chart controls */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
        <div className="flex items-center space-x-4">
          <button className="hover:text-white">
            {t("controls.drawingTools")}
          </button>
          <button className="hover:text-white">
            {t("controls.indicators")}
          </button>
          <button className="hover:text-white">{t("controls.settings")}</button>
        </div>
        <div className="flex items-center space-x-2">
          <span>
            {t("lastUpdate")}: {lastUpdate}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TradingChart;
