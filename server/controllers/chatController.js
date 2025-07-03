// const asyncHandler = require("express-async-handler");
// const Chat = require("../models/Chat");
// const User = require("../models/Users");

// // Create or fetch one-on-one chat
// const accessChat = asyncHandler(async (req, res) => {
//   const { userId } = req.body;

//   if (!userId) {
//     console.log("UserId param not sent with request");
//     return res.sendStatus(400);
//   }

//   let isChat = await Chat.find({
//     isGroupChat: false,
//     $and: [
//       { users: { $elemMatch: { $eq: req.user._id } } },
//       { users: { $elemMatch: { $eq: userId } } },
//     ],
//   })
//     .populate("users", "-password")
//     .populate("latestMessage");

//   isChat = await User.populate(isChat, {
//     path: "latestMessage.sender",
//     select: "name pic email",
//   });

//   if (isChat.length > 0) {
//     res.send(isChat[0]);
//   } else {
//     const chatData = {
//       chatName: "sender",
//       isGroupChat: false,
//       users: [req.user._id, userId],
//     };

//     try {
//       const createdChat = await Chat.create(chatData);
//       const fullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
//       res.status(200).send(fullChat);
//     } catch (error) {
//       res.status(400);
//       throw new Error(error.message);
//     }
//   }
// });

// // Fetch all chats for a user
// const fetchChats = asyncHandler(async (req, res) => {
//   try {
//     const chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
//       .populate("users", "-password")
//       .populate("groupAdmin", "-password")
//       .populate("latestMessage")
//       .sort({ updatedAt: -1 });

//     const populatedChats = await User.populate(chats, {
//       path: "latestMessage.sender",
//       select: "name pic email",
//     });

//     res.status(200).json(populatedChats);
//   } catch (error) {
//     res.status(400);
//     throw new Error(error.message);
//   }
// });


// // @desc    Create a new group chat
// // @route   POST /api/chat/group
// // @access  Protected
// const createGroupChat = asyncHandler(async (req, res) => {
//   const { name, users } = req.body;

//   if (!name || !users) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   const parsedUsers = JSON.parse(users); // 💥 this is critical

//   if (parsedUsers.length < 2) {
//     return res
//       .status(400)
//       .json({ message: "At least 2 other users are required to form a group chat" });
//   }

//   parsedUsers.push(req.user._id); // include the logged-in user

//   try {
//     const groupChat = await Chat.create({
//       chatName: name,
//       users: parsedUsers,
//       isGroupChat: true,
//       groupAdmin: req.user._id,
//     });

//     const fullGroup = await Chat.findById(groupChat._id)
//       .populate("users", "-password")
//       .populate("groupAdmin", "-password");

//     res.status(201).json(fullGroup);
//   } catch (error) {
//     console.error("🔥 Group creation error:", error);
//     res
//       .status(500)
//       .json({ message: "Internal Server Error", error: error.message });
//   }
// });


// const renameGroupChat = asyncHandler(async (req, res) => {
//   const { chatId, newName } = req.body;

//   if (!chatId || !newName) {
//     return res.status(400).json({ message: "Missing chatId or newName" });
//   }

//   const chat = await Chat.findById(chatId);

//   if (!chat) {
//     return res.status(404).json({ message: "Chat not found" });
//   }

//   // Check if user is in the list of admins
//   const isAdmin = chat.groupAdmin.some(
//     (adminId) => adminId.toString() === req.user._id.toString()
//   );

//   if (!isAdmin) {
//     return res
//       .status(403)
//       .json({ message: "Only group admins can rename the group" });
//   }

//   chat.chatName = newName;
//   await chat.save();

//   const updatedChat = await Chat.findById(chatId)
//     .populate("users", "-password")
//     .populate("groupAdmin", "-password");

//   res.json(updatedChat);
// });



// const addToGroup = asyncHandler(async (req, res) => {
//   const { chatId, userId } = req.body;

//   const chat = await Chat.findById(chatId);
//   if (!chat) return res.status(404).json({ message: "Chat not found" });

//   // Check if requester is admin
//   const isAdmin = chat.groupAdmin.includes(req.user._id.toString());
//   if (!isAdmin) {
//     return res.status(403).json({ message: "Only admins can add members" });
//   }

//   // Check if user is already in the group
//   if (chat.users.includes(userId)) {
//     return res.status(400).json({ message: "User already in group" });
//   }

//   chat.users.push(userId);
//   await chat.save();

//   const updatedChat = await Chat.findById(chatId)
//     .populate("users", "-password")
//     .populate("groupAdmin", "-password");

//   res.json(updatedChat);
// });


// const toggleAdmin = asyncHandler(async (req, res) => {
//   const { chatId, userId } = req.body;

//   const chat = await Chat.findById(chatId);
//   if (!chat) return res.status(404).json({ message: "Chat not found" });

//   const isAdmin = chat.groupAdmin.includes(req.user._id.toString());
//   if (!isAdmin) return res.status(403).json({ message: "Only admins can modify admin status" });

//   const alreadyAdmin = chat.groupAdmin.includes(userId);
//   chat.groupAdmin = alreadyAdmin
//     ? chat.groupAdmin.filter(id => id.toString() !== userId)
//     : [...chat.groupAdmin, userId];

//   await chat.save();

//   const updated = await Chat.findById(chatId)
//     .populate("users", "-password")
//     .populate("groupAdmin", "-password");

//   res.json(updated);
// });


// module.exports = { accessChat, fetchChats, createGroupChat, renameGroupChat, addToGroup, toggleAdmin };
const asyncHandler = require("express-async-handler");
const Chat = require("../models/Chat");
const User = require("../models/Users");

// Create or fetch one-on-one chat
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.sendStatus(400);

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) return res.send(isChat[0]);

  const chatData = {
    chatName: "sender",
    isGroupChat: false,
    users: [req.user._id, userId],
  };

  const createdChat = await Chat.create(chatData);
  const fullChat = await Chat.findById(createdChat._id).populate("users", "-password");
  res.status(200).send(fullChat);
});

// Fetch all chats
const fetchChats = asyncHandler(async (req, res) => {
  try {
    const chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const populatedChats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.status(200).json(populatedChats);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// Create group
const createGroupChat = asyncHandler(async (req, res) => {
  const { name, users } = req.body;
  if (!name || !users) return res.status(400).json({ message: "All fields required" });

  const parsedUsers = JSON.parse(users);
  if (parsedUsers.length < 2) return res.status(400).json({ message: "Minimum 3 members required" });

  parsedUsers.push(req.user._id);

  const groupChat = await Chat.create({
    chatName: name,
    users: parsedUsers,
    isGroupChat: true,
    groupAdmin: [req.user._id], // multiple admins supported
  });

  const fullGroup = await Chat.findById(groupChat._id)
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.status(201).json(fullGroup);
});

// Rename group
const renameGroupChat = asyncHandler(async (req, res) => {
  const { chatId, newName } = req.body;
  if (!chatId || !newName) return res.status(400).json({ message: "Missing chatId or name" });

  const chat = await Chat.findById(chatId);
  if (!chat) return res.status(404).json({ message: "Chat not found" });

  const isAdmin = chat.groupAdmin.some(adminId => adminId.toString() === req.user._id.toString());
  if (!isAdmin) return res.status(403).json({ message: "Only admins can rename group" });

  chat.chatName = newName;
  await chat.save();

  const updated = await Chat.findById(chatId)
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.json(updated);
});

// Add user to group
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat) return res.status(404).json({ message: "Chat not found" });

  const isAdmin = chat.groupAdmin.includes(req.user._id.toString());
  if (!isAdmin) return res.status(403).json({ message: "Only admins can add users" });

  if (chat.users.includes(userId)) return res.status(400).json({ message: "User already in group" });

  chat.users.push(userId);
  await chat.save();

  const updated = await Chat.findById(chatId)
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.json(updated);
});

// Promote admin
const promoteAdmin = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  console.log("🔼 Promote request:", { chatId, userId });

  if (!chatId || !userId) {
    return res.status(400).json({ message: "chatId and userId are required" });
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  // Only allow existing group admins to promote others
  const isRequesterAdmin = chat.groupAdmin.some(
    (id) => id.toString() === req.user._id.toString()
  );
  if (!isRequesterAdmin) {
    return res.status(403).json({ message: "Only admins can promote" });
  }

  // Add to admin list
  chat.groupAdmin = [...new Set([...chat.groupAdmin.map(id => id.toString()), userId])];
  await chat.save();

  const updatedChat = await Chat.findById(chatId)
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.json(updatedChat);
});

const demoteAdmin = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  console.log("🔽 Demote request:", { chatId, userId });

  if (!chatId || !userId) {
    return res.status(400).json({ message: "chatId and userId are required" });
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  const isRequesterAdmin = chat.groupAdmin.some(
    (id) => id.toString() === req.user._id.toString()
  );
  if (!isRequesterAdmin) {
    return res.status(403).json({ message: "Only admins can demote" });
  }

  chat.groupAdmin = chat.groupAdmin.filter(id => id.toString() !== userId);
  await chat.save();

  const updatedChat = await Chat.findById(chatId)
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.json(updatedChat);
});



const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat) return res.status(404).json({ message: "Chat not found" });

  const isAdmin = chat.groupAdmin.some(admin => admin.toString() === req.user._id.toString());
  if (!isAdmin) return res.status(403).json({ message: "Only admins can remove users" });

  chat.users = chat.users.filter(id => id.toString() !== userId);
  chat.groupAdmin = chat.groupAdmin.filter(id => id.toString() !== userId); // remove from admin list if needed
  await chat.save();

  const updated = await Chat.findById(chatId)
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.json(updated);
});

const deleteGroup = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId);
  if (!chat) return res.status(404).json({ message: "Group not found" });

  const isAdmin = chat.groupAdmin.some(id => id.toString() === req.user._id.toString());
  if (!isAdmin) return res.status(403).json({ message: "Only admins can delete groups" });

  await Chat.findByIdAndDelete(chatId);
  res.status(200).json({ message: "Group deleted successfully" });
});


module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroup,
  removeFromGroup,
  promoteAdmin,
  demoteAdmin,
  deleteGroup,
};

