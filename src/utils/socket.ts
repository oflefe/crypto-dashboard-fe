import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Establishes a WebSocket connection to the backend.
 * If already connected, it returns the existing socket.
 */
export const connectSocket = (): Socket => {
  if (!socket) {
    socket = io(
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000",
      {
        transports: ["websocket"],
        reconnection: true, // automatic reconnection
      }
    );

    // Event listeners for debugging
    socket.on("connect", () => {
      console.log("Connected to WebSocket:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });
  }

  return socket;
};


export const disconnectSocket = () => {
    if(socket){
        socket.disconnect()
    }
}

/**
 * Returns the existing WebSocket connection.
 * Throws an error if the socket is not connected.
 */
export const getSocket = (): Socket => {
  if (!socket) {
    throw new Error("Socket not connected. Call connectSocket() first.");
  }
  return socket;
};
