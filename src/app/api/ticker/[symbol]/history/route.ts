import { NextResponse } from "next/server";

const BINANCE_API_URL = "https://api.binance.com/api/v3/klines";

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  const { symbol } = await params;

  try {
    // Fetch historical data from Binance API
    const response = await fetch(
      `${BINANCE_API_URL}?symbol=${symbol}&interval=1d&limit=30`
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch historical data for ${symbol}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform data into a frontend-friendly format
    const transformedData = data.map((candle: any) => ({
      time: new Date(candle[0]).toISOString().split("T")[0], // Convert timestamp to YYYY-MM-DD
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching historical data" },
      { status: 500 }
    );
  }
}
