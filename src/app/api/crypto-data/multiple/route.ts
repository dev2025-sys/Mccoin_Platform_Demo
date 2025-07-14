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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get("symbols") || "bitcoin,ethereum,solana";
    const apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;

    // Fetch multiple crypto data from CoinGecko
    const response = await fetch(
      `https://pro-api.coingecko.com/api/v3/simple/price?ids=${symbols}&vs_currencies=usd&include_24hr_change=true&include_24hr_high=true&include_24hr_low=true&include_24hr_vol=true`,
      {
        headers: {
          Accept: "application/json",
          ...(apiKey && { "x-cg-pro-api-key": apiKey }),
        },
        next: { revalidate: 10 }, // Cache for 10 seconds
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch data for ${symbols}`);
    }

    const data = await response.json();

    // Transform the data to match our expected format
    const cryptoDataArray: CryptoData[] = Object.entries(data).map(
      ([id, coinData]: [string, any]) => {
        const symbolMap: Record<string, string> = {
          bitcoin: "BTC",
          ethereum: "ETH",
          solana: "SOL",
          binancecoin: "BNB",
          cardano: "ADA",
          polkadot: "DOT",
          chainlink: "LINK",
          litecoin: "LTC",
          "bitcoin-cash": "BCH",
          ripple: "XRP",
        };

        return {
          symbol: `${symbolMap[id] || id.toUpperCase()}/USDT`,
          price: coinData.usd || 0,
          change24h: coinData.usd_24h_change || 0,
          high24h: coinData.usd_24h_high || 0,
          low24h: coinData.usd_24h_low || 0,
          volume24h: coinData.usd_24h_vol || 0,
          timestamp: Date.now(),
        };
      }
    );

    return NextResponse.json(cryptoDataArray);
  } catch (error) {
    console.error("Error fetching multiple crypto data:", error);

    // Return fallback data on error
    const fallbackData: CryptoData[] = [
      {
        symbol: "BTC/USDT",
        price: 37268.0,
        change24h: 0.34,
        high24h: 37758.0,
        low24h: 36908.7,
        volume24h: 611983119.22,
        timestamp: Date.now(),
      },
      {
        symbol: "ETH/USDT",
        price: 2450.0,
        change24h: -1.2,
        high24h: 2480.0,
        low24h: 2420.0,
        volume24h: 234567890.12,
        timestamp: Date.now(),
      },
      {
        symbol: "SOL/USDT",
        price: 98.5,
        change24h: 2.1,
        high24h: 100.0,
        low24h: 96.0,
        volume24h: 12345678.9,
        timestamp: Date.now(),
      },
    ];

    return NextResponse.json(fallbackData);
  }
}
