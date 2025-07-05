require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const secretChatRoutes = require("./routes/secretChatRoutes"); // ✅ only once

connectDB();

const app = express(); // ✅ Move this BEFORE app.use

const server = http.createServer(app);

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ API Route Mounts (after app is initialized)
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/secret-chat", secretChatRoutes); // for legacy if needed
app.use("/api/secret", secretChatRoutes); // ✅ the one you're using in sidebar

// ✅ Socket.IO Setup
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log("👤 User joined room:", userData._id);
    socket.emit("connected");
  });

  socket.on("send_message", (message) => {
    const chat = message.chat;
    if (!chat.users) return console.error("No users in chat");

    chat.users.forEach((user) => {
      if (user._id === message.sender._id) return;
      socket.to(user._id).emit("receive_message", message);
    });

    console.log("📨 Message sent:", message);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
