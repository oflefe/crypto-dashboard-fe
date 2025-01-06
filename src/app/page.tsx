"use client";

import { useEffect, useState } from "react";
import { connectSocket } from "../utils/socket";

interface TickerData {
  symbol: string;
  price: string;
  change: string;
  percentChange: string;
  high: string;
  low: string;
}

export default function HomePage() {
  const [tickers, setTickers] = useState<TickerData[]>([]);
  const [flashingRows, setFlashingRows] = useState<
    Map<string, "positive" | "negative">
  >(new Map());

  const fetchTickers = async () => {
    try {
      const response = await fetch("/api/ticker/pairs");
      const data = await response.json();
      setTickers(data);
    } catch (error) {
      console.error("Error fetching tickers:", error);
    }
  };

  const updateTicker = (updatedTicker: TickerData) => {
    setTickers((prev) => {
      const index = prev.findIndex(
        (ticker) => ticker.symbol === updatedTicker.symbol
      );
      if (index !== -1) {
        const updatedTickers = [...prev];
        const previousPrice = parseFloat(prev[index].price);
        const currentPrice = parseFloat(updatedTicker.price);

        const flashType =
          currentPrice > previousPrice ? "positive" : "negative";
        triggerFlash(updatedTicker.symbol, flashType);

        updatedTickers[index] = { ...prev[index], ...updatedTicker };
        return updatedTickers;
      }
      return prev;
    });
  };

  // Flash a row briefly when updated
  const triggerFlash = (symbol: string, flashType: "positive" | "negative") => {
    setFlashingRows((prev) => {
      const updatedMap = new Map(prev);
      updatedMap.set(symbol, flashType);
      return updatedMap;
    });

    setTimeout(() => {
      setFlashingRows((prev) => {
        const updatedMap = new Map(prev);
        updatedMap.delete(symbol);
        return updatedMap;
      });
    }, 500); // Flash duration (500ms)
  };

  useEffect(() => {
    fetchTickers();
    const socket = connectSocket();
    socket.on("homepage", (data: TickerData) => {
      updateTicker(data);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <main>
      <h1>Crypto Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {tickers.map((ticker) => (
            <tr
              key={ticker.symbol}
              className={
                flashingRows.get(ticker.symbol) === "positive"
                  ? "flash-positive"
                  : flashingRows.get(ticker.symbol) === "negative"
                  ? "flash-negative"
                  : ""
              }
            >
              <td>{ticker.symbol}</td>
              <td>{ticker.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
