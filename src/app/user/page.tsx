"use client";

import { useState, useEffect } from "react";
import { connectSocket, disconnectSocket } from "../../utils/socket";
import "@/styles/user.css";
import { useRouter } from "next/navigation";

interface SubscribedPair {
  symbol: string;
  price: string;
}

interface AvailablePair {
  symbol: string;
}

export default function UserPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [subscribedPairs, setSubscribedPairs] = useState<SubscribedPair[]>([]);
  const [availablePairs, setAvailablePairs] = useState<AvailablePair[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [flashingRows, setFlashingRows] = useState<Set<string>>(new Set());

  const fetchSubscriptions = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/users/${userId}/subscriptions`);
      const data = await response.json();
      setSubscribedPairs(
        data.map((pair: any) => ({ symbol: pair.symbol, price: "" }))
      );
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

  const fetchAvailablePairs = async () => {
    try {
      const response = await fetch("/api/ticker/pairs");
      const data = await response.json();
      setAvailablePairs(data);
    } catch (error) {
      console.error("Error fetching available pairs:", error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        console.error("Login failed");
        return;
      }

      const data = await response.json();
      setIsLoggedIn(true);
      setUserId(data.id);
      localStorage.setItem("userId", String(data.id)); // Persist user ID
      fetchSubscriptions();
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        console.error("Registration failed");
        return;
      }

      console.log("User registered successfully");
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  const subscribeToPair = async (symbol: string) => {
    console.log(userId);
    if (!userId) return;

    try {
      const response = await fetch(`/api/users/${userId}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });

      if (response.ok) {
        console.log(`Subscribed to ${symbol}`);
        fetchSubscriptions();
      } else {
        console.error("Error subscribing to pair");
      }
    } catch (error) {
      console.error("Error subscribing to pair:", error);
    }
  };

  const updatePair = (updatedPair: SubscribedPair) => {
    setSubscribedPairs((prev) =>
      prev.map((pair) =>
        pair.symbol === updatedPair.symbol
          ? { ...pair, price: updatedPair.price }
          : pair
      )
    );

    triggerFlash(updatedPair.symbol);
  };

  const triggerFlash = (symbol: string) => {
    setFlashingRows((prev) => new Set(prev).add(symbol));
    setTimeout(() => {
      setFlashingRows((prev) => {
        const updatedSet = new Set(prev);
        updatedSet.delete(symbol);
        return updatedSet;
      });
    }, 500);
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      console.log("user is", storedUserId);
      setUserId(parseInt(storedUserId, 10));
      setIsLoggedIn(true);
      fetchSubscriptions();
    }
  }, [userId]);

  useEffect(() => {
    if (!isLoggedIn || !userId) return;

    const socket = connectSocket();

    socket.emit("identify", userId);

    socket.on("userUpdate", (data: SubscribedPair) => {
      updatePair(data);
    });

    return () => {
      disconnectSocket();
    };
  }, [isLoggedIn, userId]);

  useEffect(() => {
    if (showModal) fetchAvailablePairs();
  }, [showModal]);

  const filteredPairs = availablePairs.filter((pair) =>
    pair.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (symbol: string) => {
    window.location.href = `/details/${symbol}`;
  };

  return (
    <main>
      <h1>User Dashboard</h1>
      {!isLoggedIn ? (
        <div className="auth-form">
          <h2>Login or Register</h2>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button onClick={handleLogin}>Login</button>
            <button onClick={handleRegister}>Register</button>
          </div>
        </div>
      ) : (
        <div>
          <h2>Subscribed Pairs</h2>
          <button className="add-pairs" onClick={() => setShowModal(true)}>
            Add Pairs
          </button>
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {subscribedPairs.map((pair) => (
                <tr
                  key={pair.symbol}
                  className={flashingRows.has(pair.symbol) ? "flash" : ""}
                  onClick={() => handleRowClick(pair.symbol)} // Navigate on row click
                  style={{ cursor: "pointer" }} // Add visual cue for clickable rows
                >
                  <td>{pair.symbol}</td>
                  <td>{pair.price}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {showModal && (
            <div className="modal">
              <div className="modal-content">
                <h3>Add Pairs</h3>
                <input
                  type="text"
                  placeholder="Search pairs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <ul>
                  {filteredPairs.map((pair) => (
                    <li key={pair.symbol}>
                      {pair.symbol}{" "}
                      <button onClick={() => subscribeToPair(pair.symbol)}>
                        Subscribe
                      </button>
                    </li>
                  ))}
                </ul>
                <button onClick={() => setShowModal(false)}>Close</button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
