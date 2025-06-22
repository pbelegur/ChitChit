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

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("send_message", (data) => {
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
