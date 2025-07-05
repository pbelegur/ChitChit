const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const { protect } = require("../middleware/authMiddleware");

// Get current user profile
router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

// Register
router.post("/register", async (req, res) => {
  const { name, email, password, pic, secretKey } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Check for duplicate secret key
  if (secretKey) {
    const existingKey = await User.findOne({ secretKey });
    if (existingKey) {
      return res.status(400).json({ message: "Secret key already in use" });
    }
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    pic,
    secretKey: secretKey || null,
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    pic: user.pic,
    secretKey: user.secretKey,
    token,
  });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    pic: user.pic,
    secretKey: user.secretKey,
    token,
  });
});

// 🔐 Update secret key
router.put("/secret-key", protect, async (req, res) => {
  const { secretKey } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const existing = await User.findOne({ secretKey });
  if (existing && existing._id.toString() !== req.user._id.toString()) {
    return res.status(400).json({ message: "Secret key already in use." });
  }

  user.secretKey = secretKey;
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    pic: user.pic,
    secretKey: user.secretKey,
    token,
  });
});

// 🔍 Search users
router.get("/", protect, async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  try {
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Search failed", error: err.message });
  }
});

// ✅ GET users with secret keys (for dropdown)
router.get("/with-secret-key", protect, async (req, res) => {
  try {
    const users = await User.find({
      secretKey: { $exists: true, $ne: "" },
      _id: { $ne: req.user._id },
    }).select("name email pic");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch secret contacts" });
  }
});

module.exports = router;
