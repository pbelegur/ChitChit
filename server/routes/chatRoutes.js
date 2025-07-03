const express = require("express");
const router = express.Router();

const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroup,
  removeFromGroup,
  promoteAdmin,
  demoteAdmin,
  deleteGroup
} = require("../controllers/chatController");

const { protect } = require("../middleware/authMiddleware");

// Chat access and fetch
router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);

// Group creation
router.post("/group", protect, createGroupChat);

// Rename group
router.put("/rename", protect, renameGroupChat);

// Add/Remove users
router.put("/add", protect, addToGroup);
router.put("/group/remove", protect, removeFromGroup);     // ✅ matches frontend

// Promote/Demote admins
router.put("/group/promote", protect, promoteAdmin);       // ✅ matches frontend
router.put("/group/demote", protect, demoteAdmin);

// Delete group
router.delete("/:chatId", protect, deleteGroup);           // ✅ matches frontend

module.exports = router;
