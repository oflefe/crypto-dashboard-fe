import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  const { symbol } = params;

  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch details for symbol: ${symbol}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      symbol: data.symbol,
      price: data.lastPrice,
      highPrice: data.highPrice,
      lowPrice: data.lowPrice,
      priceChange: data.priceChange,
      priceChangePercent: data.priceChangePercent,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while fetching symbol details" },
      { status: 500 }
    );
  }
}
