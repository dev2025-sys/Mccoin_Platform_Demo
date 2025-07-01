// app/[locale]/api/newsdata/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  const apiKey = process.env.NEWSDATA_API_KEY;
  const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&country=ae&language=en&q=${q}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data.results);
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
