"use client";
import Header from "@/components/spot/Header";
import { useState } from "react";
import { X } from "lucide-react";
import Markets from "@/components/spot/Markets";
import TradingChart from "@/components/spot/TradingChart";
import TradingForm from "@/components/spot/TradingForm";
import OrderBook from "@/components/spot/OrderBook";
import Portfolio from "@/components/spot/Portfolio";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const SpotPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<
    "chart" | "book" | "trade" | "portfolio"
  >("chart");

  return (
    <section className="bg-[#07153b]">
      <Navbar />
      <div className="bg-[#07153b] text-white min-h-screen flex flex-col xl:max-w-[70%] mx-auto">
        {/* Header */}
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-80 max-w-sm">
              <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
                <h2 className="text-lg font-semibold">Trading Menu</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <Markets />
            </div>
          </div>
        )}

        {/* Desktop Layout */}
        <div className="flex-1 hidden lg:flex">
          {/* Left Sidebar - Markets */}
          <Markets />

          {/* Main Center Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chart Section */}
            <div className="flex-1 p-4">
              <TradingChart />
            </div>

            {/* Trading Form Section */}
            <TradingForm />
          </div>

          {/* Right Sidebar - Order Book */}
          <div className="w-80 xl:w-96">
            <OrderBook />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex-1 lg:hidden">
          {/* Mobile tab navigation */}
          <div className="bg-slate-800 border-b border-slate-700">
            <div className="flex">
              {[
                { key: "chart", label: "Chart", icon: "📈" },
                { key: "book", label: "Book", icon: "📊" },
                { key: "trade", label: "Trade", icon: "💱" },
                { key: "portfolio", label: "Portfolio", icon: "💼" },
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setMobileTab(key as any)}
                  className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                    mobileTab === key
                      ? "text-orange-500 border-b-2 border-orange-500"
                      : "text-gray-400"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span>{icon}</span>
                    <span>{label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile content */}
          <div className="flex-1">
            {mobileTab === "chart" && (
              <div className="p-4">
                <TradingChart height={300} />
              </div>
            )}
            {mobileTab === "book" && <OrderBook />}
            {mobileTab === "trade" && <TradingForm />}
            {mobileTab === "portfolio" && <Portfolio />}
          </div>
        </div>

        {/* Desktop Bottom Section - Portfolio */}
        <div className="hidden lg:block">
          <Portfolio />
        </div>
      </div>
      <Footer />
    </section>
  );
};
export default SpotPage;
