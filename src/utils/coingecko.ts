export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
}

const COINGECKO_API = "https://api.coingecko.com/api/v3";

export async function getTopCoins(limit: number = 100): Promise<CoinData[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&locale=en`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data from CoinGecko");
    }

    const data: CoinData[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data from CoinGecko:", error);
    return [];
  }
}

export function formatPrice(price: number): string {
  if (price >= 1_000_000_000) {
    return `$${(price / 1_000_000_000).toFixed(2)}B`;
  } else if (price >= 1_000_000) {
    return `$${(price / 1_000_000).toFixed(2)}M`;
  } else if (price >= 1) {
    return `$${price.toFixed(2)}`;
  } else {
    return `$${price.toFixed(8)}`;
  }
}

export function formatPriceChange(change: number): string {
  return change > 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
}

export function formatVolume(volume: number): string {
  return formatPrice(volume);
}

export function getTopGainers(coins: CoinData[]): CoinData[] {
  return [...coins]
    .filter((coin) => coin.price_change_percentage_24h > 0)
    .sort(
      (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
    )
    .slice(0, 8);
}

export function getTopLosers(coins: CoinData[]): CoinData[] {
  return [...coins]
    .filter((coin) => coin.price_change_percentage_24h < 0)
    .sort(
      (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h
    )
    .slice(0, 8);
}

export function getTopByVolume(coins: CoinData[]): CoinData[] {
  return [...coins].sort((a, b) => b.total_volume - a.total_volume).slice(0, 8);
}

export function getTopByMarketCap(coins: CoinData[]): CoinData[] {
  return [...coins].sort((a, b) => b.market_cap - a.market_cap).slice(0, 8);
}

export function getPriceChangeDistribution(coins: CoinData[]): number[] {
  const ranges = [9, 7, 5, 3, 0, -3, -5, -7, -9, -Infinity];
  const distribution = new Array(10).fill(0);

  coins.forEach((coin) => {
    const change = coin.price_change_percentage_24h;
    const index = ranges.findIndex((range) => change >= range);
    if (index !== -1) {
      distribution[index]++;
    }
  });

  return distribution;
}

export function getOrderDistribution(coins: CoinData[]): [number, number] {
  const totalCoins = coins.length;
  const positiveChanges = coins.filter(
    (coin) => coin.price_change_percentage_24h > 0
  ).length;
  const negativeChanges = totalCoins - positiveChanges;

  return [
    (positiveChanges / totalCoins) * 100,
    (negativeChanges / totalCoins) * 100,
  ];
}
