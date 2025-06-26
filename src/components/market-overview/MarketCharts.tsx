import { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import type { ChartConfiguration, ScriptableContext } from "chart.js";

interface MarketChartsProps {
  title: string;
  type: "pie" | "bar";
  data: number[];
}

export default function MarketCharts({ title, type, data }: MarketChartsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [timeframe, setTimeframe] = useState("6h");

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    let config: ChartConfiguration;

    if (type === "pie") {
      config = {
        type: "doughnut",
        data: {
          labels: ["Buy", "Sell"],
          datasets: [
            {
              data,
              backgroundColor: ["#22c55e", "#ef4444"],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "#94a3b8",
                font: {
                  size: 12,
                  weight: 500,
                },
                padding: 20,
                usePointStyle: true,
                pointStyle: "circle",
              },
            },
          },
        },
      };
    } else {
      config = {
        type: "bar",
        data: {
          labels: [
            "3%",
            "5%",
            "7%",
            "10%",
            ">10%",
            "-3%",
            "-5%",
            "-7%",
            "-10%",
            "<-10%",
          ],
          datasets: [
            {
              label: "Price Change Distribution",
              data,
              backgroundColor: (context: ScriptableContext<"bar">) => {
                const index = context.dataIndex;
                return index < 5 ? "#22c55e" : "#ef4444";
              },
              borderWidth: 0,
              borderRadius: 2,
              barThickness: 16,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
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
              grid: {
                color: "#1e293b",
                display: true,
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
                maxTicksLimit: 5,
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      };
    }

    // Create new chart
    chartInstance.current = new Chart(ctx, config);

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, timeframe]);

  return (
    <div className="bg-[#050E27] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">{title}</h2>
        {type === "pie" && (
          <div className="flex items-center space-x-2">
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
        )}
      </div>
      <div className="h-[300px]">
        <canvas ref={canvasRef} />
      </div>
      {type === "bar" && (
        <div className="flex justify-between mt-4 text-sm">
          <div className="flex items-center">
            <span className="text-[#22c55e] font-medium">
              {data.slice(0, 5).reduce((a, b) => a + b, 0)}
            </span>
            <span className="text-slate-400 ml-1">Price up</span>
          </div>
          <div className="flex items-center">
            <span className="text-[#ef4444] font-medium">
              {data.slice(5).reduce((a, b) => a + b, 0)}
            </span>
            <span className="text-slate-400 ml-1">Price down</span>
          </div>
        </div>
      )}
    </div>
  );
}
