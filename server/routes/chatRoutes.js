const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const { protect } = require("../middleware/authMiddleware");

// Create or fetch 1-on-1 chat
router.post("/", protect, async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).send("UserId not provided");
  }

  let chat = await Chat.findOne({
    isGroupChat: false,
    users: { $all: [req.user._id, userId] },
  }).populate("users", "-password");

  if (chat) return res.send(chat);

  const newChat = await Chat.create({
    chatName: "sender",
    isGroupChat: false,
    users: [req.user._id, userId],
  });

  const fullChat = await Chat.findById(newChat._id).populate("users", "-password");

  res.status(200).json(fullChat);
});

// Fetch all chats for logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    res.status(200).send(chats);
  } catch (error) {
    res.status(400).send("Error fetching chats");
  }
});

module.exports = router;
