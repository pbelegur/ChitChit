import React, { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Backend server

function App() {
  useEffect(() => {
    socket.on("receive_message", (data) => {
      console.log("📨 Message received:", data);
    });
  }, []);

  useEffect(() => {
  socket.on("connect", () => {
    console.log("✅ Connected to socket server with ID:", socket.id);
  });

  socket.on("receive_message", (data) => {
    console.log("📨 Message received:", data);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Connection error:", err);
  });
}, []);

  const sendMessage = () => {
    socket.emit("send_message", { message: "Hello from React!" });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>💬 Chit Chat</h1>
      <button onClick={sendMessage}>Send Dummy Message</button>
    </div>
  );
}

export default App;
