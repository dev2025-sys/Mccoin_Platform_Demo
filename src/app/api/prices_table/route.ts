import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch(
      'https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=1h,24h,7d',
      {
        headers: {
          Accept: 'application/json',
          'x-cg-pro-api-key': process.env.NEXT_PUBLIC_COINGECKO_API_KEY!,
        },
        next: { revalidate: 60 },
      },
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error('CoinGecko API error:', errorText);
      return NextResponse.json([], { status: 200 });
    }

    const data = await res.json();

    const formatted = data.map((coin: any) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      image: coin.image,
      price: coin.current_price,
      percent_change_1h: coin.price_change_percentage_1h_in_currency,
      percent_change_24h: coin.price_change_percentage_24h_in_currency,
      percent_change_7d: coin.price_change_percentage_7d_in_currency,
      market_cap: coin.market_cap,
      volume_24h: coin.total_volume,
      circulating_supply: coin.circulating_supply,
      sparkline_7d: coin.sparkline_in_7d?.price || [],
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json([], { status: 200 });
  }
}
