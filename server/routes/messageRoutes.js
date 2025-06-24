const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const { protect } = require("../middleware/authMiddleware");

// Send a message
router.post("/", protect, async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.status(400).json({ message: "Missing content or chatId" });
  }

  const message = await Message.create({
    sender: req.user._id,
    content,
    chat: chatId,
  });

  const fullMessage = await message
    .populate("sender", "name pic")
    .populate("chat")
    .execPopulate();

  await Chat.findByIdAndUpdate(chatId, { latestMessage: fullMessage });

  res.status(200).json(fullMessage);
});

// Fetch all messages from a chat
router.get("/:chatId", protect, async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.status(200).json(messages);
  } catch (err) {
    res.status(400).json({ message: "Error fetching messages" });
  }
});

module.exports = router;
