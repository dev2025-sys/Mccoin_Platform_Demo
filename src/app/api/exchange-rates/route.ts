import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch crypto prices in multiple fiat currencies
    const cryptoResponse = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd,aed,gbp,eur,cad",
      {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 30 }, // Cache for 30 seconds
      }
    );

    if (!cryptoResponse.ok) {
      throw new Error("Failed to fetch crypto prices");
    }

    const cryptoData = await cryptoResponse.json();

    // Format the response to match our expected structure
    const exchangeRates = {
      BTC: {
        USD: cryptoData.bitcoin.usd,
        AED: cryptoData.bitcoin.aed,
        GBP: cryptoData.bitcoin.gbp,
        EUR: cryptoData.bitcoin.eur,
        CAD: cryptoData.bitcoin.cad,
      },
      ETH: {
        USD: cryptoData.ethereum.usd,
        AED: cryptoData.ethereum.aed,
        GBP: cryptoData.ethereum.gbp,
        EUR: cryptoData.ethereum.eur,
        CAD: cryptoData.ethereum.cad,
      },
      USDT: {
        USD: cryptoData.tether.usd,
        AED: cryptoData.tether.aed,
        GBP: cryptoData.tether.gbp,
        EUR: cryptoData.tether.eur,
        CAD: cryptoData.tether.cad,
      },
    };

    return NextResponse.json(exchangeRates);
  } catch (error) {
    console.error("Error fetching exchange rates:", error);

    // Return fallback static rates on error
    const fallbackRates = {
      BTC: { USD: 65000, AED: 238000, GBP: 51000, EUR: 60000, CAD: 88000 },
      ETH: { USD: 3500, AED: 12850, GBP: 2750, EUR: 3220, CAD: 4725 },
      USDT: { USD: 1, AED: 3.67, GBP: 0.78, EUR: 0.92, CAD: 1.36 },
    };

    return NextResponse.json(fallbackRates);
  }
}
