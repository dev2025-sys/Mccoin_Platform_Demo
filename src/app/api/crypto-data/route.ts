import { NextResponse } from "next/server";

export interface CryptoData {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  timestamp: number;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export interface OrderBookData {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  timestamp: number;
}

// Helper function to generate realistic order book data
function generateOrderBook(currentPrice: number): OrderBookData {
  const generateLevel = (basePrice: number, isBid: boolean, index: number) => {
    const priceOffset = (index + 1) * (Math.random() * 2 + 0.5);
    const price = isBid ? basePrice - priceOffset : basePrice + priceOffset;

    const amount = Math.random() * 0.5 + 0.1;
    const total = amount * price;

    return {
      price: Math.round(price * 100) / 100,
      amount: Math.round(amount * 1000000) / 1000000,
      total: Math.round(total * 100) / 100,
    };
  };

  const bids = Array.from({ length: 15 }, (_, i) =>
    generateLevel(currentPrice, true, i)
  ).sort((a, b) => b.price - a.price);

  const asks = Array.from({ length: 15 }, (_, i) =>
    generateLevel(currentPrice, false, i)
  ).sort((a, b) => a.price - b.price);

  return {
    bids,
    asks,
    timestamp: Date.now(),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "bitcoin";
  const includeOrderBook = searchParams.get("orderBook") === "true";

  try {
    // Map common symbols to CoinGecko IDs
    const symbolMap: Record<string, string> = {
      BTC: "bitcoin",
      ETH: "ethereum",
      SOL: "solana",
      BNB: "binancecoin",
      ADA: "cardano",
      DOT: "polkadot",
      LINK: "chainlink",
      LTC: "litecoin",
      BCH: "bitcoin-cash",
      XRP: "ripple",
    };

    const coinGeckoId = symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();

    // Get API key from environment
    const apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;

    // Fetch detailed crypto data from CoinGecko
    const response = await fetch(
      `https://pro-api.coingecko.com/api/v3/coins/${coinGeckoId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
      {
        headers: {
          Accept: "application/json",
          ...(apiKey && { "x-cg-pro-api-key": apiKey }),
        },
        next: { revalidate: 30 }, // Cache for 30 seconds to reduce API calls
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch data for ${symbol}`);
    }

    const data = await response.json();
    const marketData = data.market_data;

    // Format the response to match our expected structure
    const cryptoData: CryptoData = {
      symbol: `${data.symbol.toUpperCase()}/USDT`,
      price: marketData.current_price.usd || 0,
      change24h: marketData.price_change_percentage_24h || 0,
      high24h: marketData.high_24h.usd || 0,
      low24h: marketData.low_24h.usd || 0,
      volume24h: marketData.total_volume.usd || 0,
      timestamp: Date.now(),
    };

    // Include order book data if requested
    if (includeOrderBook) {
      const orderBook = generateOrderBook(cryptoData.price);
      return NextResponse.json({
        priceData: cryptoData,
        orderBook,
      });
    }

    return NextResponse.json(cryptoData);
  } catch (error) {
    console.error("Error fetching crypto data:", error);

    // Return fallback data on error
    const fallbackData: CryptoData = {
      symbol: "BTC/USDT",
      price: 37268.0,
      change24h: 0.34,
      high24h: 37758.0,
      low24h: 36908.7,
      volume24h: 611983119.22,
      timestamp: Date.now(),
    };

    if (searchParams.get("orderBook") === "true") {
      const orderBook = generateOrderBook(fallbackData.price);
      return NextResponse.json({
        priceData: fallbackData,
        orderBook,
      });
    }

    return NextResponse.json(fallbackData);
  }
}
