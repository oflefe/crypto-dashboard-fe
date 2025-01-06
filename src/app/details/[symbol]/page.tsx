"use client";

import { useEffect, useState } from "react";
import { connectSocket } from "../../../utils/socket";
import { useParams } from "next/navigation";

interface SymbolDetails {
  symbol: string;
  price: string;
  high: string;
  low: string;
  priceChange: string;
  percentChange: string;
}

export default function DetailsPage() {
  const [details, setDetails] = useState<SymbolDetails | null>(null);
  const params = useParams<{ symbol: string }>();

  const fetchSymbolDetails = async (symbol: string) => {
    try {
      const response = await fetch(`/api/ticker/${symbol}/details`);
      const data = await response.json();
      setDetails({
        symbol: data.symbol,
        price: data.price,
        high: data.highPrice,
        low: data.lowPrice,
        priceChange: data.priceChange,
        percentChange: data.priceChangePercent,
      });
    } catch (error) {
      console.error("Error fetching symbol details:", error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchSymbolDetails(params.symbol);
      const socket = connectSocket();
      socket.emit("joinSymbolDetails", params.symbol);
      socket.on("symbolDetailsUpdate", (data: SymbolDetails) => {
        if (data.symbol === params.symbol) {
          setDetails(data);
        }
      });
      return () => {
        socket.disconnect();
      };
    };

    initialize();
  }, [params.symbol]);

  if (!details) {
    return <p>Loading details...</p>;
  }

  return (
    <main>
      <h1>Details for {details.symbol}</h1>
      <table>
        <tbody>
          <tr>
            <th>Symbol</th>
            <td>{details.symbol}</td>
          </tr>
          <tr>
            <th>Price</th>
            <td>{details.price}</td>
          </tr>
          <tr>
            <th>24h High</th>
            <td>{details.high}</td>
          </tr>
          <tr>
            <th>24h Low</th>
            <td>{details.low}</td>
          </tr>
          <tr>
            <th>Price Change</th>
            <td>{details.priceChange}</td>
          </tr>
          <tr>
            <th>Price Change (%)</th>
            <td>{details.percentChange}%</td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
