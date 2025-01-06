"use client";

import { useEffect, useState } from "react";
import { connectSocket } from "../../../utils/socket";
import { useParams } from "next/navigation";
import "../../../styles/details.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HistoricalDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

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
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>(
    []
  );
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

  const fetchHistoricalData = async (symbol: string) => {
    try {
      const response = await fetch(`/api/ticker/${symbol}/history`);
      const data = await response.json();
      setHistoricalData(data);
    } catch (error) {
      console.error("Error fetching historical data:", error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchSymbolDetails(params.symbol);
      await fetchHistoricalData(params.symbol);
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

  const chartData = {
    labels: historicalData.map((point) => point.time),
    datasets: [
      {
        label: "Close Price",
        data: historicalData.map((point) => point.close),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: `1-Month History (${params.symbol})` },
    },
  };

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
      <h1>{params.symbol} Historical Chart</h1>
      <div style={{ marginTop: "30px", height: "600px", width: "1200px" }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </main>
  );
}
