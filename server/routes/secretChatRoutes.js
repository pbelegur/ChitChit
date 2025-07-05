const express = require("express");
const router = express.Router();
const SecretChat = require("../models/SecretChat");
const { protect } = require("../middleware/authMiddleware");

// ✅ Send a secret message to another user
router.post("/send", protect, async (req, res) => {
  const { content, to } = req.body;

  if (!content || !to) {
    return res.status(400).json({ message: "Missing content or recipient" });
  }

const message = await SecretChat.create({
  sender: req.user._id,
  recipient: to,
  message: content,
  secretKey: req.user.secretKey,
});

  await message.populate("sender", "name");

  res.status(201).json(message);
});

// ✅ Fetch secret chat between current user and selected recipient
router.get("/with/:userId", protect, async (req, res) => {
  const { userId } = req.params;

  const messages = await SecretChat.find({
    $or: [
      { sender: req.user._id, recipient: userId },
      { sender: userId, recipient: req.user._id },
    ],
  })
    .sort({ timestamp: 1 })
    .populate("sender", "name");

  res.json(messages);
});


// ✅ Get users you've had secret chat with (based on secretKey)
// ✅ Get users you've had secret chat with (based on secretKey)
router.get("/contacts", protect, async (req, res) => {
  const myId = req.user._id;
  const key = req.user.secretKey;

  if (!key) {
    return res.status(400).json({ message: "You haven't set a secret key." });
  }

  const messages = await SecretChat.find({ secretKey: key })
    .populate("sender", "name _id pic")
    .populate("recipient", "name _id pic");

  const contactsMap = {};

  messages.forEach((msg) => {
    if (msg.sender && msg.sender._id.toString() === myId.toString() && msg.recipient) {
      contactsMap[msg.recipient._id] = msg.recipient;
    } else if (msg.recipient && msg.recipient._id.toString() === myId.toString() && msg.sender) {
      contactsMap[msg.sender._id] = msg.sender;
    }
  });

  res.json(Object.values(contactsMap));
});


module.exports = router;
