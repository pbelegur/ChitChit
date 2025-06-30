require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes"); // Moved here
const { Server } = require("socket.io");

connectDB(); // Connect to DB

const app = express(); // ✅ MUST come before using app

const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use("/api/user", userRoutes); // ✅ Now this works
app.use("/api/user", require("./routes/userRoutes"));

const chatRoutes = require("./routes/chatRoutes");
app.use("/api/chat", chatRoutes);

const messageRoutes = require("./routes/messageRoutes");
app.use("/api/message", messageRoutes);


const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});


io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  socket.on("setup", (userData) => {
    socket.join(userData._id); // Join a room by user ID
    console.log("👤 User joined room:", userData._id);
    socket.emit("connected");
  });

  socket.on("send_message", (message) => {
    const chat = message.chat;
    if (!chat.users) return console.error("No users in chat");

    chat.users.forEach((user) => {
      if (user._id === message.sender._id) return; // Skip sender
      socket.to(user._id).emit("receive_message", message);
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});


io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("send_message", (data) => {
    console.log("📨 Message received from client:", data); // 👈 Add this line
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
