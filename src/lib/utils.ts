import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format large numbers for display
export function formatNumber(num: number, decimals: number = 2): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(decimals) + "B";
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(decimals) + "M";
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(decimals) + "K";
  }
  return num.toFixed(decimals);
}

// Format price with appropriate decimals
export function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else if (price >= 1) {
    return price.toFixed(2);
  } else {
    return price.toFixed(6);
  }
}

// Format percentage change
export function formatPercentageChange(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

// Get color class based on price change
export function getPriceChangeColor(change: number): string {
  if (change > 0) return "text-green-400";
  if (change < 0) return "text-red-400";
  return "text-gray-400";
}
