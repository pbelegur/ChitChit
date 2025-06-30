import React, { useEffect, useState } from "react";
import axios from "axios";
import socket from "../socket";
import ChatBox from "../components/ChatBox";
import SearchUsers from "../components/searchUsers"; 

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const fetchChats = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("userInfo")).token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.get("http://localhost:5000/api/chat", config);
      console.log("📦 Rendering chats:", data);
      setChats(data);
    } catch (error) {
      console.error("🔥 Error fetching chats", error);
    }
  };

  useEffect(() => {
    fetchChats();

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo) {
      socket.emit("setup", userInfo);
    }

    socket.on("connect", () => {
      console.log("✅ Socket connected!", socket.id);
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  const handleNewChat = (newChat) => {
    if (!chats.find((chat) => chat._id === newChat._id)) {
      setChats((prev) => [newChat, ...prev]);
    }
    setSelectedChat(newChat);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        gap: "20px",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          flex: 1,
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "10px",
          overflowY: "auto",
        }}
      >
        <h3>Your Chats</h3>
        <SearchUsers onChatCreated={handleNewChat} />

        {chats.map((chat) => {
          let currentUserId = null;
          try {
            currentUserId = JSON.parse(localStorage.getItem("userInfo"))?._id;
          } catch {
            console.warn("⚠️ userInfo not found");
          }

          const otherUser = chat.users?.find((u) => u._id !== currentUserId);

          return (
            <div
              key={chat._id}
              onClick={() => setSelectedChat(chat)}
              style={{
                padding: "10px",
                margin: "10px 0",
                borderRadius: "5px",
                backgroundColor:
                  selectedChat?._id === chat._id ? "#dfe6e9" : "#f1f2f6",
                cursor: "pointer",
              }}
            >
              <strong>
                {chat.isGroupChat ? chat.chatName : otherUser?.name || "Unknown"}
              </strong>
              <p style={{ fontSize: "12px", margin: 0 }}>
                {chat.latestMessage?.content || "No messages yet"}
              </p>
            </div>
          );
        })}
      </div>

      <div style={{ flex: 2 }}>
        {selectedChat ? (
          <ChatBox selectedChat={selectedChat} />
        ) : (
          <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h3>Select a chat to start messaging</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
