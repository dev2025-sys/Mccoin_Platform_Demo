import { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import type { ChartConfiguration } from "chart.js";

interface HistoricalChartProps {
  title: string;
}

// Mock data to match the design
const mockData = {
  labels: Array.from({ length: 50 }, (_, i) => i), // More data points for smoother lines
  datasets: [
    {
      label: "BTC",
      data: [
        16000, 15000, 13000, 12500, 13000, 14000, 15000, 17000, 18000, 19000,
        17000, 15000, 18000, 17500, 17000, 16500, 16000, 15500, 15000, 14500,
        14000, 13500, 13000, 12500, 12000, 11500, 11000, 10500, 10000, 9500,
        9000, 8500, 8000, 7500, 7000, 6500, 6000, 5500, 5000, 4500, 4000, 3500,
        3000, 2500, 2000, 1500, 1000, 500, 0, 19000,
      ],
      borderColor: "#3b82f6",
      backgroundColor: "#3b82f6",
      tension: 0.4,
      pointRadius: 0,
    },
    {
      label: "ETH",
      data: [
        10000, 9500, 9000, 8500, 8000, 7500, 7000, 6500, 6000, 5500, 5000, 4500,
        4000, 3500, 3000, 2500, 2000, 1500, 1000, 500, 0, 500, 1000, 1500, 2000,
        2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000,
        8500, 9000, 9500, 10000, 9500, 9000, 8500, 8000, 7500, 7000, 6500, 6000,
        8000,
      ],
      borderColor: "#8b5cf6",
      backgroundColor: "#8b5cf6",
      tension: 0.4,
      pointRadius: 0,
    },
    {
      label: "BNB",
      data: [
        7000, 6800, 6600, 6400, 6200, 6000, 5800, 5600, 5400, 5200, 5000, 4800,
        4600, 4400, 4200, 4000, 3800, 3600, 3400, 3200, 3000, 2800, 2600, 2400,
        2200, 2000, 1800, 1600, 1400, 1200, 1000, 800, 600, 400, 200, 0, 200,
        400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600,
        6000,
      ],
      borderColor: "#22c55e",
      backgroundColor: "#22c55e",
      tension: 0.4,
      pointRadius: 0,
    },
    {
      label: "TETHER",
      data: [
        4000, 4100, 4200, 4300, 4400, 4300, 4200, 4100, 4000, 3900, 3800, 3700,
        3600, 3500, 3400, 3300, 3200, 3100, 3000, 2900, 2800, 2700, 2600, 2500,
        2400, 2300, 2200, 2100, 2000, 1900, 1800, 1700, 1600, 1500, 1400, 1300,
        1200, 1100, 1000, 900, 800, 700, 600, 500, 400, 300, 200, 100, 0, 3500,
      ],
      borderColor: "#ef4444",
      backgroundColor: "#ef4444",
      tension: 0.4,
      pointRadius: 0,
    },
    {
      label: "SOLANA",
      data: [
        2000, 1900, 1800, 1700, 1600, 1500, 1400, 1300, 1200, 1100, 1000, 900,
        800, 700, 600, 500, 400, 300, 200, 100, 0, 100, 200, 300, 400, 500, 600,
        700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800,
        1900, 2000, 1900, 1800, 1700, 1600, 1500, 1400, 1300, 1200, 2000,
      ],
      borderColor: "#94a3b8",
      backgroundColor: "#94a3b8",
      tension: 0.4,
      pointRadius: 0,
    },
  ],
};

const legendData = [
  { label: "BTC", value: "10.398" },
  { label: "ETH", value: "6.251" },
  { label: "BNB", value: "5.006" },
  { label: "TETHER", value: "3.388" },
  { label: "SOLANA", value: "2.175" },
];

export default function HistoricalChart({ title }: HistoricalChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [timeframe, setTimeframe] = useState("6h");

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: "line",
      data: mockData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: "index",
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#94a3b8",
              font: {
                size: 11,
                weight: 500,
              },
            },
            border: {
              display: false,
            },
          },
          y: {
            position: "left",
            grid: {
              color: "#1e293b",
            },
            border: {
              display: false,
            },
            ticks: {
              color: "#94a3b8",
              font: {
                size: 11,
                weight: 500,
              },
              callback: function (value) {
                return value + "K";
              },
            },
            min: 0,
            max: 20000,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "#0c1e4e",
            titleColor: "#94a3b8",
            bodyColor: "#fff",
            bodyFont: {
              size: 12,
              weight: 500,
            },
            padding: 12,
            borderColor: "#1e293b",
            borderWidth: 1,
          },
        },
      },
    };

    // Create new chart
    chartInstance.current = new Chart(ctx, config);

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [timeframe]);

  return (
    <div className="bg-[#050E27] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">{title}</h2>
        <div className="flex items-center space-x-4">
          {/* Legend box */}
          <div className="bg-[#0c1e4e] rounded-lg p-3">
            <div className="flex items-center gap-4">
              {legendData.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.label === "BTC"
                        ? "bg-[#3b82f6]"
                        : item.label === "ETH"
                        ? "bg-[#8b5cf6]"
                        : item.label === "BNB"
                        ? "bg-[#22c55e]"
                        : item.label === "TETHER"
                        ? "bg-[#ef4444]"
                        : "bg-[#94a3b8]"
                    }`}
                  />
                  <span className="text-sm text-white">
                    {item.label}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Time selector */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-[#0c1e4e] text-white text-sm rounded px-2 py-1 border border-slate-700"
          >
            <option value="6h">6h</option>
            <option value="24h">24h</option>
            <option value="7d">7d</option>
            <option value="30d">30d</option>
          </select>
        </div>
      </div>
      <div className="h-[400px]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
