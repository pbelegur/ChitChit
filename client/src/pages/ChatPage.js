import React, { useEffect, useState } from "react";
import axios from "axios";

const ChatPage = () => {
  const [chats, setChats] = useState([]);

  const fetchChats = async () => {
  try {
    const token = JSON.parse(localStorage.getItem("userInfo")).token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const { data } = await axios.get("http://localhost:5000/api/chat", config);
    console.log(data); // 🔍 TEMP debug
    setChats(data);
  } catch (error) {
    console.error("Error fetching chats", error);
  }
};

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Your Chats</h2>
      {chats.map((chat) => (
        <div
          key={chat._id}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          {chat.isGroupChat
            ? chat.chatName
            : chat.users.find(
                (u) => u._id !== JSON.parse(localStorage.getItem("userInfo"))._id
              )?.name}
        </div>
      ))}
    </div>
  );
};

export default ChatPage;
